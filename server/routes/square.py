from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from square.client import Client
from os import getenv
from dotenv import load_dotenv
import datetime

from fine import table  # Fine.dev SDK for DB access

load_dotenv()
router = APIRouter()

class InvoiceRequest(BaseModel):
    appointment_id: int

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
        return {"status": "Invoice Sent", "invoiceId": invoice["id"]}
    else:
        raise HTTPException(status_code=500, detail="Invoice publish failed")