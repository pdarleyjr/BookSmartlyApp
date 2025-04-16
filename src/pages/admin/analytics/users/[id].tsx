import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { analyticsApi } from "@/api/analytics";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, ArrowLeft } from "lucide-react";
import { IOSButton } from "@/components/ui/ios-button";

const AdminUserAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user data
        const users = await fine.table("users")
          .select()
          .eq("id", id);
        
        if (users && users.length > 0) {
          setUserData(users[0]);
          
          // Fetch analytics data for this user
          const data = await analyticsApi.getUserAnalytics(id);
          setAnalyticsData(data);
        } else {
          toast({
            title: "Error",
            description: "User not found.",
            variant: "destructive",
          });
          navigate("/admin/analytics");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user analytics data. Please try again.",
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
    if (!analyticsData) return [];
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map(day => ({
      name: day,
      appointments: analyticsData.appointmentsByDay[day] || 0
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
          User Analytics: {userData?.name || userData?.email || "User"}
        </h1>
        
        {isLoading ? (
          <p className="text-center py-8 font-montserrat">Loading user analytics data...</p>
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
                      <div className="text-3xl font-bold font-poppins">{analyticsData?.totalAppointments || 0}</div>
                      <p className="text-xs text-muted-foreground font-montserrat">All time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-montserrat">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full p-2 bg-secondary/10">
                      <Calendar className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold font-poppins">{analyticsData?.appointmentsThisMonth || 0}</div>
                      <p className="text-xs text-muted-foreground font-montserrat">Current month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-montserrat">Avg. Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full p-2 bg-accent/10">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold font-poppins">{analyticsData?.averageDuration || 0}</div>
                      <p className="text-xs text-muted-foreground font-montserrat">Minutes per appointment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute to ensure only admins can access
export default () => (
  <AdminProtectedRoute Component={AdminUserAnalyticsPage} />
);