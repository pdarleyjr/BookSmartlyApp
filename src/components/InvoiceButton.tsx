import { useState } from "react";
import { Button } from "./ui/button";
import { sendInvoice } from "@/api/invoicing";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface InvoiceButtonProps {
  appointmentId: number;
  className?: string;
}

export function InvoiceButton({ appointmentId, className }: InvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendInvoice = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await sendInvoice(appointmentId);
      toast.success("Invoice sent to client!");
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error("Error sending invoice");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSendInvoice} 
      className={className}
      disabled={isLoading}
      variant="outline"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        "Send Invoice"
      )}
    </Button>
  );
}