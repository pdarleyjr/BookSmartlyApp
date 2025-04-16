import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Header } from "@/components/Header";
import { IOSButton } from "@/components/ui/ios-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { adminApi } from "@/api/admin";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Clock, MapPin, User } from "lucide-react";
import type { Schema } from "@/lib/db-types";

const AppointmentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<(Schema["appointments"] & { userName?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all appointments to find the specific one
        const allAppointments = await adminApi.getAllAppointments();
        const foundAppointment = allAppointments.find(a => a.id === parseInt(id));
        
        if (foundAppointment) {
          setAppointment(foundAppointment);
        } else {
          toast({
            title: "Error",
            description: "Appointment not found.",
            variant: "destructive",
          });
          navigate("/admin");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load appointment data. Please try again.",
          variant: "destructive",
        });
        navigate("/admin");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

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
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
          <p className="text-center py-8 font-montserrat">Loading appointment data...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <IOSButton 
            variant="ghost" 
            onClick={() => navigate("/admin")}
            className="ios-touch-target flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Admin Dashboard
          </IOSButton>
        </div>
        
        {appointment && (
          <Card className="max-w-2xl mx-auto ios-card overflow-hidden border-none shadow-md">
            <div className="h-2 bg-coral w-full" />
            <CardHeader>
              <CardTitle className="text-2xl font-poppins">{appointment.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-2 font-montserrat">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg">{appointment.userName || "Unknown User"}</span>
              </div>
              
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
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-2 font-poppins">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm font-montserrat">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{appointment.createdAt ? new Date(appointment.createdAt).toLocaleString() : "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>{appointment.updatedAt ? new Date(appointment.updatedAt).toLocaleString() : "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">User ID</p>
                    <p className="break-all">{appointment.userId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Appointment ID</p>
                    <p>{appointment.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

// Wrap with AdminProtectedRoute to ensure only admins can access
export default () => (
  <AdminProtectedRoute Component={AppointmentDetailsPage} />
);