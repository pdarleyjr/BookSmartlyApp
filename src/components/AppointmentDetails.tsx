import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { format } from "date-fns";
import { Calendar, Clock, User, MapPin, DollarSign } from "lucide-react";
import { appointmentsApi } from "@/api/appointments";
import { IOSInvoiceButton } from "./IOSInvoiceButton";
import type { Schema } from "@/lib/db-types";

interface AppointmentDetailsProps {
  appointmentId: number;
  userId: string;
}

export function AppointmentDetails({ appointmentId, userId }: AppointmentDetailsProps) {
  const [appointment, setAppointment] = useState<Schema["appointments"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setIsLoading(true);
        const data = await appointmentsApi.getAppointmentById(appointmentId, userId);
        setAppointment(data);
      } catch (err) {
        console.error("Error fetching appointment:", err);
        setError("Failed to load appointment details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, userId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (error || !appointment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || "Appointment not found"}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{appointment.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(appointment.startTime), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(appointment.startTime), "h:mm a")} - 
            {format(new Date(appointment.endTime), "h:mm a")}
          </span>
        </div>
        
        {appointment.clientName && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.clientName}</span>
          </div>
        )}
        
        {appointment.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.location}</span>
          </div>
        )}
        
        {appointment.price && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${appointment.price.toFixed(2)}</span>
          </div>
        )}
        
        {appointment.description && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Notes</h4>
            <p className="text-sm text-muted-foreground">{appointment.description}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline">Edit</Button>
          <IOSInvoiceButton appointmentId={appointment.id || 0} />
        </div>
      </CardFooter>
    </Card>
  );
}