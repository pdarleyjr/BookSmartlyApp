import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, MapPin, Calendar, Clock, User, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { IOSButton } from "@/components/ui/ios-button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/redux/hooks";
import { deleteAppointment } from "@/redux/slices/appointmentsSlice";
import { fine } from "@/lib/fine";
import { appointmentTypesApi } from "@/api/appointment-types";
import { locationsApi } from "@/api/locations";
import { adminApi } from "@/api/admin";
import type { Schema } from "@/lib/db-types";

type AppointmentProps = {
  appointment: Schema["appointments"];
  onDelete: () => void;
};

export function AppointmentCard({ appointment, onDelete }: AppointmentProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [appointmentType, setAppointmentType] = useState<Schema["appointment_types"] | null>(null);
  const [location, setLocation] = useState<Schema["locations"] | null>(null);
  const [assignedUser, setAssignedUser] = useState<Schema["users"] | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const loadRelatedData = async () => {
      try {
        // Load appointment type if available
        if (appointment.appointmentTypeId) {
          const type = await appointmentTypesApi.getAppointmentTypeById(appointment.appointmentTypeId);
          setAppointmentType(type);
        }
        
        // Load location if available
        if (appointment.locationId) {
          const loc = await locationsApi.getLocationById(appointment.locationId);
          setLocation(loc);
        }
        
        // Load assigned user if available
        if (appointment.assignedToUserId && appointment.assignedToUserId !== session?.user?.id) {
          try {
            const users = await fine.table("users")
              .select()
              .eq("id", appointment.assignedToUserId);
            
            if (users && users.length > 0) {
              setAssignedUser(users[0]);
            }
          } catch (error) {
            console.error("Error fetching assigned user:", error);
          }
        }
      } catch (error) {
        console.error("Error loading related appointment data:", error);
      }
    };
    
    loadRelatedData();
  }, [appointment, session?.user?.id]);

  const handleDelete = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsDeleting(true);
      await dispatch(deleteAppointment({ 
        id: appointment.id!, 
        userId: session.user.id 
      })).unwrap();
      
      toast({
        title: "Appointment deleted",
        description: "Your appointment has been successfully deleted.",
      });
      onDelete();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return format(parseISO(timeString), "h:mm a");
    } catch {
      return timeString;
    }
  };

  const formatDate = (timeString: string) => {
    try {
      return format(parseISO(timeString), "EEEE, MMMM d, yyyy");
    } catch {
      return timeString;
    }
  };

  return (
    <Card className="ios-card w-full overflow-hidden border-none shadow-sm rounded-xl active:scale-[0.98] transition-transform">
      <div className="h-2 bg-primary w-full" />
      <CardHeader className="pt-4">
        <CardTitle className="text-xl font-poppins">
          {appointment.clientName ? (
            <>
              <span className="text-sm text-muted-foreground block">Client</span>
              {appointment.clientName}
            </>
          ) : (
            appointment.title
          )}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1 font-montserrat">
          <Calendar className="h-4 w-4" />
          {formatDate(appointment.startTime)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointmentType && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-medium">{appointmentType.name}</span>
              {appointment.price && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  {appointment.price.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}
        
        {appointment.description && (
          <p className="text-sm text-muted-foreground font-montserrat">{appointment.description}</p>
        )}
        
        <div className="flex flex-col gap-2 text-sm font-montserrat">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span>
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </span>
          </div>
          
          {location && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-secondary" />
              </div>
              <span>{location.name}</span>
            </div>
          )}
          
          {assignedUser && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-4 w-4 text-accent" />
              </div>
              <span>{assignedUser.name || assignedUser.email}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pb-4">
        <IOSButton
          variant="outline"
          size="sm"
          onClick={() => navigate(`/edit-appointment/${appointment.id}`)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </IOSButton>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <IOSButton variant="destructive" size="sm" disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </IOSButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="ios-card rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-poppins">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="font-montserrat">
                This action cannot be undone. This will permanently delete your appointment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-montserrat">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive font-montserrat">
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}