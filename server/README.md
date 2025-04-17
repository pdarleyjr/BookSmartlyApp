# BookSmartly Square Integration

This is the FastAPI backend for the BookSmartly Square integration, which allows sending invoices to clients after therapy appointments.

## Features

- Create and send Square invoices to clients
- Match or create Square customers based on client email
- Sandbox mode for testing without real money
- Production-ready with environment variable configuration

## Setup

### Prerequisites

- Python 3.11 or higher
- Square Developer Account
- Fine.dev account

### Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Set up environment variables (see `.env.example` in the root directory):

```
# Square Sandbox (Testing)
SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=your_sandbox_token
SQUARE_LOCATION_ID=your_sandbox_location_id

# Fine.dev endpoint
VITE_FINE_ENDPOINT=your_fine_endpoint
```

### Running the Server

```bash
uvicorn main:app --reload
```

The server will be available at http://localhost:8000.

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

## Testing

The integration uses Square's Sandbox environment for testing. This allows you to:

- Send real emails with sandbox invoice links
- Test the full workflow without moving real money
- View invoices and their status in the Square Developer Dashboard

## Production Deployment

When ready to go live:

1. Update the environment variables in Fine.dev project settings:

```
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=your_live_access_token
SQUARE_LOCATION_ID=your_live_location_id
```

2. Redeploy via Fine.dev

## Integration with Frontend

The frontend uses the `src/api/invoicing.ts` module to interact with this API. The `IOSInvoiceButton` component provides a ready-to-use button for sending invoices.

Example usage:

```tsx
<IOSInvoiceButton
  appointmentId={appointment.id}
  className="your-custom-class"
/>
```

## Docker Support

The server includes a Dockerfile and is configured in the project's docker-compose.yml file. To run the full stack:

```bash
docker-compose up