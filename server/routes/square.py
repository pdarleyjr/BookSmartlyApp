from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from square.client import Client
from os import getenv
from dotenv import load_dotenv
from typing import List, Optional
import datetime

from fine import table  # Fine.dev SDK for DB access

load_dotenv()
router = APIRouter()

class InvoiceRequest(BaseModel):
    appointment_id: int

class BulkInvoiceRequest(BaseModel):
    invoiceId: Optional[str] = None
    appointmentIds: List[int]
    clientName: str
    amount: float

square = Client(
    access_token=getenv("SQUARE_ACCESS_TOKEN"),
    environment=getenv("SQUARE_ENVIRONMENT")
)

@router.post("/api/square/invoice/create-and-send")
async def create_invoice(request: InvoiceRequest):
    appointment = await table("appointments").select().eq("id", request.appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    client = await table("clients").select().eq("name", appointment["clientName"]).first()
    if not client or not client["email"]:
        raise HTTPException(status_code=400, detail="Client must have an email")

    # Match or create Square customer
    customer_result = square.customers.search_customers(body={
        "query": {"filter": {"email_address": {"exact": client["email"]}}}
    })

    if customer_result.is_success() and customer_result.body.get("customers"):
        customer_id = customer_result.body["customers"][0]["id"]
    else:
        create_result = square.customers.create_customer(body={
            "given_name": client["name"],
            "email_address": client["email"]
        })
        customer_id = create_result.body["customer"]["id"]

    # Create order
    order_result = square.orders.create_order(
        body={
            "order": {
                "location_id": getenv("SQUARE_LOCATION_ID"),
                "customer_id": customer_id,
                "line_items": [
                    {
                        "name": appointment["title"] or "Therapy Session",
                        "quantity": "1",
                        "base_price_money": {
                            "amount": int(float(appointment["price"]) * 100),
                            "currency": "USD"
                        }
                    }
                ]
            }
        }
    )
    order_id = order_result.body["order"]["id"]

    # Create and send invoice
    invoice_result = square.invoices.create_invoice(
        body={
            "invoice": {
                "location_id": getenv("SQUARE_LOCATION_ID"),
                "order_id": order_id,
                "primary_recipient": {"customer_id": customer_id},
                "payment_requests": [{
                    "request_type": "BALANCE",
                    "due_date": (datetime.date.today() + datetime.timedelta(days=7)).isoformat()
                }],
                "delivery_method": "EMAIL",
                "title": f"Invoice for {appointment['title']}",
                "description": "Thank you for your appointment."
            },
            "idempotency_key": str(uuid4())
        }
    )
    invoice = invoice_result.body["invoice"]
    publish = square.invoices.publish_invoice(
        invoice_id=invoice["id"],
        body={"version": invoice["version"]}
    )

    if publish.is_success():
        # Update appointment billing status
        await table("appointments").update({"billingStatus": "billed"}).eq("id", request.appointment_id)
        return {"status": "Invoice Sent", "invoiceId": invoice["id"]}
    else:
        raise HTTPException(status_code=500, detail="Invoice publish failed")

@router.post("/api/square/invoices")
async def create_bulk_invoice(request: BulkInvoiceRequest):
    """Create and send an invoice for multiple appointments"""
    
    # Get the first appointment to find client info
    appointments = []
    client_email = None
    
    for appointment_id in request.appointmentIds:
        appointment = await table("appointments").select().eq("id", appointment_id).first()
        if not appointment:
            continue
        appointments.append(appointment)
        
        # Try to find client email
        if not client_email and appointment.get("clientName"):
            client = await table("clients").select().eq("name", appointment["clientName"]).first()
            if client and client.get("email"):
                client_email = client["email"]
    
    if not appointments:
        raise HTTPException(status_code=404, detail="No valid appointments found")
    
    if not client_email:
        # Use a placeholder email if we can't find a real one
        client_email = f"{request.clientName.lower().replace(' ', '.')}@example.com"
        
    # Match or create Square customer
    customer_result = square.customers.search_customers(body={
        "query": {"filter": {"email_address": {"exact": client_email}}}
    })

    if customer_result.is_success() and customer_result.body.get("customers"):
        customer_id = customer_result.body["customers"][0]["id"]
    else:
        create_result = square.customers.create_customer(body={
            "given_name": request.clientName,
            "email_address": client_email
        })
        customer_id = create_result.body["customer"]["id"]

    # Create order with multiple line items
    line_items = []
    for appointment in appointments:
        line_items.append({
            "name": appointment["title"] or "Therapy Session",
            "quantity": "1",
            "base_price_money": {
                "amount": int(float(appointment["price"] or 0) * 100),
                "currency": "USD"
            }
        })
    
    order_result = square.orders.create_order(
        body={
            "order": {
                "location_id": getenv("SQUARE_LOCATION_ID"),
                "customer_id": customer_id,
                "line_items": line_items
            }
        }
    )
    order_id = order_result.body["order"]["id"]

    # Create and send invoice
    invoice_result = square.invoices.create_invoice(
        body={
            "invoice": {
                "location_id": getenv("SQUARE_LOCATION_ID"),
                "order_id": order_id,
                "primary_recipient": {"customer_id": customer_id},
                "payment_requests": [{
                    "request_type": "BALANCE",
                    "due_date": (datetime.date.today() + datetime.timedelta(days=7)).isoformat()
                }],
                "delivery_method": "EMAIL",
                "title": f"Invoice for {request.clientName}",
                "description": f"Invoice for {len(appointments)} appointments"
            },
            "idempotency_key": str(uuid4())
        }
    )
    invoice = invoice_result.body["invoice"]
    
    # Get the invoice URL
    invoice_url = f"https://squareup.com/dashboard/invoices/{invoice['id']}"
    if getenv("SQUARE_ENVIRONMENT") == "sandbox":
        invoice_url = f"https://squareupsandbox.com/dashboard/invoices/{invoice['id']}"
    
    publish = square.invoices.publish_invoice(
        invoice_id=invoice["id"],
        body={"version": invoice["version"]}
    )

    if publish.is_success():
        # Update appointment billing statuses
        for appointment_id in request.appointmentIds:
            await table("appointments").update({"billingStatus": "billed"}).eq("id", appointment_id)
            
        # If we have an invoice ID in the database, update it
        if request.invoiceId:
            await table("invoices").update({
                "status": "sent",
                "squareInvoiceId": invoice["id"],
                "squareInvoiceUrl": invoice_url,
                "updatedAt": datetime.datetime.now().isoformat()
            }).eq("id", request.invoiceId)
            
        return {
            "status": "Invoice Sent", 
            "squareInvoiceId": invoice["id"],
            "squareInvoiceUrl": invoice_url
        }
    else:
        raise HTTPException(status_code=500, detail="Invoice publish failed")

@router.get("/api/square/invoice/{invoice_id}")
async def get_invoice_status(invoice_id: str):
    """Get the status of a Square invoice"""
    try:
        result = square.invoices.get_invoice(invoice_id=invoice_id)
        if result.is_success():
            invoice = result.body["invoice"]
            return {
                "status": invoice["status"],
                "paymentStatus": invoice.get("payment_requests", [{}])[0].get("computed_amount_money", {}).get("amount", 0)
            }
        else:
            raise HTTPException(status_code=404, detail="Invoice not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving invoice: {str(e)}")