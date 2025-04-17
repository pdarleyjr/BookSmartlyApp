import { useState } from "react";
import { sendInvoice } from "@/api/invoicing";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { IOSButton } from "./ui/ios-button";

interface IOSInvoiceButtonProps {
  appointmentId: number;
  className?: string;
}

export function IOSInvoiceButton({ appointmentId, className }: IOSInvoiceButtonProps) {
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
    <IOSButton 
      onClick={handleSendInvoice} 
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        "Send Invoice"
      )}
    </IOSButton>
  );
}