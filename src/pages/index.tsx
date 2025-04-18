import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CalendarView } from "@/components/CalendarView";
import { AppointmentCard } from "@/components/AppointmentCard";
import { IOSButton } from "@/components/ui/ios-button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/route-components";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const loadAppointments = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch appointments for the user
        const data = await fine.table("appointments")
          .select()
          .eq("userId", session.user.id);
        
        setAppointments(data || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppointments();
  }, [session?.user?.id]);

  // Get appointments for the selected date
  const appointmentsForSelectedDate = appointments.filter(appointment => {
    try {
      const appointmentDate = new Date(appointment.startTime);
      return (
        appointmentDate.getDate() === selectedDate.getDate() &&
        appointmentDate.getMonth() === selectedDate.getMonth() &&
        appointmentDate.getFullYear() === selectedDate.getFullYear()
      );
    } catch {
      return false;
    }
  });

  const handleRefresh = async () => {
    if (session?.user?.id) {
      try {
        const data = await fine.table("appointments")
          .select()
          .eq("userId", session.user.id);
        
        setAppointments(data || []);
      } catch (error) {
        console.error("Error refreshing appointments:", error);
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-poppins">Calendar</h1>
          <IOSButton
            onClick={() => navigate("/create-appointment")}
            className="ios-touch-target"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </IOSButton>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Calendar Column */}
          <div className="w-full md:w-7/12 lg:w-8/12">
            <CalendarView
              appointments={appointments}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
          
          {/* Appointments Column */}
          <div className="w-full md:w-5/12 lg:w-4/12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-poppins">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
            </div>
            
            {isLoading ? (
              <p className="text-center py-8 font-montserrat">Loading appointments...</p>
            ) : appointmentsForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {appointmentsForSelectedDate.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onDelete={handleRefresh}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-xl bg-muted/30 shadow-sm">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-2 font-poppins">No appointments</h3>
                <p className="text-muted-foreground mb-4 font-montserrat">
                  You don't have any appointments scheduled for this day.
                </p>
                <IOSButton
                  onClick={() => navigate("/create-appointment")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Appointment
                </IOSButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedDashboard = () => (
  <ProtectedRoute Component={Dashboard} />
);

export default ProtectedDashboard;