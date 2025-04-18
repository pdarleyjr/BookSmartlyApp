import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, MapPin, Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { 
  Card, 
  CardContent, 
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
  const { data: session } = fine.auth.useSession();

  const handleDelete = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsDeleting(true);
      await fine.table("appointments")
        .delete()
        .eq("id", appointment.id)
        .eq("userId", session.user.id);
      
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
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>{appointment.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(appointment.startTime)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
        </div>
        
        {appointment.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.location}</span>
          </div>
        )}
        
        {appointment.description && (
          <p className="text-sm text-muted-foreground mt-2">{appointment.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your appointment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}