import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Calendar, ArrowLeft, MapPin } from "lucide-react";
import { IOSButton } from "@/components/ui/ios-button";

const AdminLocationAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [locationData, setLocationData] = useState<any>(null);
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch location data
        const locations = await fine.table("locations")
          .select()
          .eq("id", parseInt(id));
        
        if (locations && locations.length > 0) {
          setLocationData(locations[0]);
          
          // Fetch appointments for this location
          const appointments = await fine.table("appointments")
            .select()
            .eq("locationId", parseInt(id));
          
          setAppointmentsData(appointments);
        } else {
          toast({
            title: "Error",
            description: "Location not found.",
            variant: "destructive",
          });
          navigate("/admin/analytics");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load location analytics data. Please try again.",
          variant: "destructive",
        });
        navigate("/admin/analytics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Format data for charts
  const getDayOfWeekData = () => {
    if (appointmentsData.length === 0) return [];
    
    const dayCount: Record<string, number> = {
      'Sunday': 0,
      'Monday': 0,
      'Tuesday': 0,
      'Wednesday': 0,
      'Thursday': 0,
      'Friday': 0,
      'Saturday': 0
    };
    
    appointmentsData.forEach(appointment => {
      try {
        const appointmentDate = new Date(appointment.startTime);
        const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
        dayCount[dayOfWeek] = (dayCount[dayOfWeek] || 0) + 1;
      } catch {
        // Skip invalid dates
      }
    });
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map(day => ({
      name: day,
      appointments: dayCount[day] || 0
    }));
  };

  // Get monthly data for the past 6 months
  const getMonthlyData = () => {
    if (appointmentsData.length === 0) return [];
    
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    
    // Initialize the past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const monthYear = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthYear] = 0;
    }
    
    // Count appointments by month
    appointmentsData.forEach(appointment => {
      try {
        const appointmentDate = new Date(appointment.startTime);
        const monthYear = appointmentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        // Only count if it's within the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        
        if (appointmentDate >= sixMonthsAgo) {
          monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
        }
      } catch {
        // Skip invalid dates
      }
    });
    
    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      appointments: count
    }));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <IOSButton 
            variant="ghost" 
            onClick={() => navigate("/admin/analytics")}
            className="ios-touch-target flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Analytics Dashboard
          </IOSButton>
        </div>
        
        <h1 className="text-3xl font-bold mb-6 font-poppins">
          Location Analytics: {locationData?.name || "Location"}
        </h1>
        
        {isLoading ? (
          <p className="text-center py-8 font-montserrat">Loading location analytics data...</p>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-montserrat">Total Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full p-2 bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold font-poppins">{appointmentsData.length}</div>
                      <p className="text-xs text-muted-foreground font-montserrat">All time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-montserrat">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full p-2 bg-secondary/10">
                      <MapPin className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <div className="text-xl font-bold font-poppins">{locationData?.name}</div>
                      <p className="text-xs text-muted-foreground font-montserrat">
                        {locationData?.address || "No address provided"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-montserrat">Busiest Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full p-2 bg-accent/10">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      {getDayOfWeekData().length > 0 ? (
                        <>
                          <div className="text-xl font-bold font-poppins">
                            {getDayOfWeekData().sort((a, b) => b.appointments - a.appointments)[0].name}
                          </div>
                          <p className="text-xs text-muted-foreground font-montserrat">
                            {getDayOfWeekData().sort((a, b) => b.appointments - a.appointments)[0].appointments} appointments
                          </p>
                        </>
                      ) : (
                        <div className="text-lg font-medium font-poppins">No data</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-poppins">Appointments by Day of Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getDayOfWeekData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#5865F2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="font-poppins">Monthly Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getMonthlyData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="appointments" stroke="#EB459E" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute to ensure only admins can access
export default () => (
  <AdminProtectedRoute Component={AdminLocationAnalyticsPage} />
);