import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { MapPin, Calendar, Clock, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { IOSButton } from "@/components/ui/ios-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/route-components";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
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
import type { Schema } from "@/lib/db-types";

const AppointmentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Schema["appointments"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id || !session?.user?.id) return;

      try {
        setIsLoading(true);
        const data = await fine.table("appointments")
          .select()
          .eq("id", parseInt(id))
          .eq("userId", session.user.id);

        if (data && data.length > 0) {
          setAppointment(data[0]);
        } else {
          toast({
            title: "Error",
            description: "Appointment not found or you don't have permission to view it.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load appointment details. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id, session?.user?.id, navigate]);

  const handleDelete = async () => {
    if (!session?.user?.id || !appointment?.id) return;
    
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
      navigate("/");
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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-center py-8">Loading appointment details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <IOSButton 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Calendar
            </IOSButton>
          </div>
          
          {appointment && (
            <Card>
              <CardHeader>
                <CardTitle>{appointment.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>{formatDate(appointment.startTime)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </span>
                </div>
                
                {appointment.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{appointment.location}</span>
                  </div>
                )}
                
                {appointment.description && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">{appointment.description}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <IOSButton 
                  variant="outline" 
                  onClick={() => navigate(`/edit-appointment/${appointment.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </IOSButton>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <IOSButton variant="destructive" disabled={isDeleting}>
                      <Trash2 className="h-4 w-4 mr-2" />
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
          )}
        </div>
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedAppointmentDetails = () => (
  <ProtectedRoute Component={AppointmentDetailsPage} />
);

export default ProtectedAppointmentDetails;