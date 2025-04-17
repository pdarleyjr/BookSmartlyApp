/**
 * Invoicing API client for Square integration
 */

/**
 * Send an invoice for an appointment using Square
 * @param appointmentId - The ID of the appointment to invoice
 * @returns Promise with the invoice result
 */
export const sendInvoice = async (appointmentId: number) => {
  const res = await fetch(`/api/square/invoice/create-and-send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointment_id: appointmentId }),
  });

  if (!res.ok) throw new Error("Failed to send invoice");
  return await res.json();
};