import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, MapPin, Calendar, Clock } from "lucide-react";
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
import type { Schema } from "@/lib/db-types";

type AppointmentProps = {
  appointment: Schema["appointments"];
  onDelete: () => void;
};

export function AppointmentCard({ appointment, onDelete }: AppointmentProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { data: session } = fine.auth.useSession();

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
    } catch (error) {
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
    } catch (e) {
      return timeString;
    }
  };

  const formatDate = (timeString: string) => {
    try {
      return format(parseISO(timeString), "EEEE, MMMM d, yyyy");
    } catch (e) {
      return timeString;
    }
  };

  return (
    <Card className="ios-card w-full overflow-hidden border-none shadow-md">
      <div className="h-2 bg-coral w-full" />
      <CardHeader className="pt-4">
        <CardTitle className="text-xl font-poppins">{appointment.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1 font-montserrat">
          <Calendar className="h-4 w-4" />
          {formatDate(appointment.startTime)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointment.description && (
          <p className="text-sm text-muted-foreground font-montserrat">{appointment.description}</p>
        )}
        <div className="flex flex-col gap-2 text-sm font-montserrat">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </span>
          </div>
          {appointment.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.location}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pb-4">
        <IOSButton 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/edit-appointment/${appointment.id}`)}
          className="ios-touch-target"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </IOSButton>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <IOSButton variant="destructive" size="sm" disabled={isDeleting} className="ios-touch-target">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </IOSButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="ios-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-poppins">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="font-montserrat">
                This action cannot be undone. This will permanently delete your appointment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="ios-touch-target font-montserrat">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="ios-touch-target bg-coral font-montserrat">
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}