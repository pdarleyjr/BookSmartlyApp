import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Layout } from "@/components/layout/Layout";
import { CalendarView } from "@/components/CalendarView";
import { AppointmentCard } from "@/components/AppointmentCard";
import { IOSButton } from "@/components/ui/ios-button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAppointments, fetchAppointmentsByDateRange, setSelectedDate } from "@/redux/slices/appointmentsSlice";
import { ProtectedRoute } from "@/components/auth/route-components";

const Dashboard = () => {
  const [selectedDate, setSelectedDateState] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(state => state.appointments.items);
  
  // Get appointments for the selected date
  const appointmentsForSelectedDate = appointments.filter(appointment => {
    try {
      const appointmentDate = new Date(appointment.startTime);
      return (
        appointmentDate.getDate() === selectedDate.getDate() &&
        appointmentDate.getMonth() === selectedDate.getMonth() &&
        appointmentDate.getFullYear() === selectedDate.getFullYear()
      );
    } catch (e) {
      return false;
    }
  }).sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  useEffect(() => {
    const loadAppointments = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all appointments for the user
        await dispatch(fetchAppointments(session.user.id)).unwrap();
        
        // Also fetch appointments for the current month range
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        
        await dispatch(fetchAppointmentsByDateRange({
          userId: session.user.id,
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString()
        })).unwrap();
      } catch (error) {
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
  }, [session?.user?.id, dispatch]);

  const handleDateSelect = (date: Date) => {
    setSelectedDateState(date);
    dispatch(setSelectedDate(date.toISOString()));
    
    // When selecting a date in a different month, fetch appointments for that month
    if (date.getMonth() !== selectedDate.getMonth() && session?.user?.id) {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      dispatch(fetchAppointmentsByDateRange({
        userId: session.user.id,
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString()
      }));
    }
  };

  const handleRefresh = () => {
    if (session?.user?.id) {
      dispatch(fetchAppointments(session.user.id));
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Calendar Column */}
          <div className="w-full md:w-7/12 lg:w-8/12">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold font-poppins">Calendar</h1>
              <IOSButton 
                onClick={() => navigate("/create-appointment")}
                className="ios-touch-target bg-coral text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </IOSButton>
            </div>
            
            <CalendarView 
              appointments={appointments}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
          
          {/* Appointments Column */}
          <div className="w-full md:w-5/12 lg:w-4/12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-poppins">
                {format(selectedDate, "MMMM d, yyyy")}
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
              <div className="text-center py-8 border rounded-lg bg-muted/30">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-2 font-poppins">No appointments</h3>
                <p className="text-muted-foreground mb-4 font-montserrat">
                  You don't have any appointments scheduled for this day.
                </p>
                <IOSButton 
                  onClick={() => navigate("/create-appointment")}
                  className="ios-touch-target bg-coral text-white"
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