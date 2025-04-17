# Square Integration Guide for BookSmartly

This guide provides detailed information about the Square integration for BookSmartly, which allows generating and emailing invoices to clients after therapy appointments.

## Overview

The Square integration enables BookSmartly to:

1. Create and send professional invoices to clients
2. Track payment status in Square Dashboard
3. Accept online payments through Square-hosted payment pages
4. Maintain a customer database in Square

## Environment Setup

### Required Environment Variables

Add these to Fine.dev Project Settings under Environment Variables:

```
# Square Sandbox (Testing)
SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=EAAAl8GPJNw7KWjpWHiIX9ZFGOjqoBtG1cAhn32Lc_cUhQBL7btGp1iTvl4yYk8J
SQUARE_LOCATION_ID=LZC177YC3SB0M
```

When going live, update with production credentials:

```
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=YOUR_LIVE_ACCESS_TOKEN
SQUARE_LOCATION_ID=YOUR_LIVE_LOCATION_ID
```

Fine.dev automatically loads these into both frontend (via Vite import.meta.env) and backend using process.env.

## Architecture

The integration consists of:

1. **FastAPI Backend** (`server/routes/square.py`):
   - Handles API requests for invoice creation
   - Communicates with Square API
   - Manages customer creation/matching

2. **Frontend API Client** (`src/api/invoicing.ts`):
   - Provides a simple interface for sending invoices
   - Handles error states and loading states

3. **UI Components**:
   - `IOSInvoiceButton.tsx`: iOS-styled button for sending invoices
   - `InvoiceButton.tsx`: Standard button for sending invoices

## API Endpoints

### POST /api/square/invoice/create-and-send

Creates and sends an invoice for an appointment.

**Request Body:**

```json
{
  "appointment_id": 123
}
```

**Response:**

```json
{
  "status": "Invoice Sent",
  "invoiceId": "inv_123456"
}
```

**Error Responses:**

- 404: Appointment not found
- 400: Client must have an email
- 500: Invoice publish failed

## Usage in Components

### Basic Usage

```tsx
import { IOSInvoiceButton } from "@/components/IOSInvoiceButton";

function AppointmentDetails({ appointment }) {
  return (
    <div>
      <h2>{appointment.title}</h2>
      <p>Client: {appointment.clientName}</p>
      <p>Price: ${appointment.price}</p>
      
      <IOSInvoiceButton appointmentId={appointment.id} />
    </div>
  );
}
```

### With Custom Styling

```tsx
<IOSInvoiceButton 
  appointmentId={appointment.id} 
  className="my-custom-class"
/>
```

## Testing with Square Sandbox

The integration uses Square's Sandbox environment for testing, which allows:

1. Real emails to be sent with sandbox invoice links
2. No real money to be moved
3. All payments to simulate success/failure for testing
4. Viewing invoices and their status in Square Developer Dashboard

To access the Square Developer Dashboard:

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Select your application
3. Navigate to "Sandbox Test Account"
4. Click "Open Sandbox Test Account"

## Production Transition

When ready to go live:

1. Create a production Square application in the Square Developer Dashboard
2. Generate production credentials (access token and location ID)
3. Replace sandbox keys in Fine.dev project settings:

```
SQUARE_ACCESS_TOKEN=LIVE_ACCESS_TOKEN
SQUARE_LOCATION_ID=LIVE_LOCATION_ID
SQUARE_ENVIRONMENT=production
```

4. Redeploy via Fine.dev

## Troubleshooting

### Common Issues

1. **Invoice fails to send**:
   - Check that the client has a valid email address
   - Verify Square credentials are correct
   - Check network connectivity to Square API

2. **Customer not found in Square**:
   - The integration automatically creates customers if they don't exist
   - Verify the client has an email address in BookSmartly

3. **Sandbox vs. Production confusion**:
   - Check the SQUARE_ENVIRONMENT variable is set correctly
   - Sandbox uses test credentials, production uses live credentials

## Additional Resources

- [Square Developer Documentation](https://developer.squareup.com/docs)
- [Square Invoices API](https://developer.squareup.com/docs/invoices-api/overview)
- [Square Customers API](https://developer.squareup.com/docs/customers-api/overview)