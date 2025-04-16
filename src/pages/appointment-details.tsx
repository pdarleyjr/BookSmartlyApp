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
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { deleteAppointment, fetchAppointmentById } from "@/redux/slices/appointmentsSlice";
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
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(state => state.appointments.items);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id || !session?.user?.id) return;

      try {
        setIsLoading(true);
        
        // First check if we already have the appointment in Redux store
        const existingAppointment = appointments.find(a => a.id === parseInt(id));
        
        if (existingAppointment) {
          setAppointment(existingAppointment);
          setIsLoading(false);
          return;
        }
        
        // If not in store, fetch from API
        const result = await dispatch(fetchAppointmentById({
          id: parseInt(id),
          userId: session.user.id
        })).unwrap();

        if (result) {
          setAppointment(result);
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
  }, [id, session?.user?.id, navigate, appointments, dispatch]);

  const handleDelete = async () => {
    if (!session?.user?.id || !appointment?.id) return;
    
    try {
      setIsDeleting(true);
      await dispatch(deleteAppointment({ 
        id: appointment.id, 
        userId: session.user.id 
      })).unwrap();
      
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
            <p className="text-center py-8 font-montserrat">Loading appointment details...</p>
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
              className="ios-touch-target flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Calendar
            </IOSButton>
          </div>
          
          {appointment && (
            <Card className="ios-card w-full overflow-hidden border-none shadow-md">
              <div className="h-2 bg-coral w-full" />
              <CardHeader className="pt-4">
                <CardTitle className="text-2xl font-poppins">{appointment.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-2 font-montserrat">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">{formatDate(appointment.startTime)}</span>
                </div>
                
                <div className="flex items-center gap-2 font-montserrat">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </span>
                </div>
                
                {appointment.location && (
                  <div className="flex items-center gap-2 font-montserrat">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg">{appointment.location}</span>
                  </div>
                )}
                
                {appointment.description && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-medium mb-2 font-poppins">Description</h3>
                    <p className="text-muted-foreground font-montserrat">{appointment.description}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pb-6">
                <IOSButton 
                  variant="outline" 
                  onClick={() => navigate(`/edit-appointment/${appointment.id}`)}
                  className="ios-touch-target"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </IOSButton>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <IOSButton variant="destructive" disabled={isDeleting} className="ios-touch-target">
                      <Trash2 className="h-4 w-4 mr-2" />
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