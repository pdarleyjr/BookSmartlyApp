import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { analyticsApi } from "@/api/analytics";
import { useAdminStatus } from "@/hooks/use-admin";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Calendar, Clock, Users, Building, BarChart2 } from "lucide-react";

const COLORS = ['#5865F2', '#EB459E', '#57F287', '#FEE75C', '#ED4245', '#9B59B6', '#3498DB', '#2ECC71'];

const AdminAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, isSuperAdmin, isOrgAdmin, organizationId } = useAdminStatus();
  const { data: session } = fine.auth.useSession();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (isOrgAdmin && organizationId) {
          // Fetch organization analytics
          const data = await analyticsApi.getOrganizationAnalytics(organizationId);
          setAnalyticsData(data);
        } else if (isSuperAdmin) {
          // For super admin, we could fetch analytics for all organizations
          // For now, just fetch for the first organization or use user analytics
          const orgs = await fine.table("organizations").select();
          
          if (orgs && orgs.length > 0) {
            const data = await analyticsApi.getOrganizationAnalytics(orgs[0].id!);
            setAnalyticsData(data);
          } else if (session?.user?.id) {
            // Fallback to user analytics if no orgs
            const data = await analyticsApi.getUserAnalytics(session.user.id);
            setAnalyticsData(data);
          }
        } else if (session?.user?.id) {
          // Fallback to user analytics
          const data = await analyticsApi.getUserAnalytics(session.user.id);
          setAnalyticsData(data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isOrgAdmin, isSuperAdmin, organizationId, session?.user?.id]);

  // Format data for charts
  const getDayOfWeekData = () => {
    if (!analyticsData) return [];
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map(day => ({
      name: day,
      appointments: analyticsData.appointmentsByDay[day] || 0
    }));
  };

  const getAppointmentTypeData = () => {
    if (!analyticsData) return [];
    return analyticsData.appointmentsByType;
  };

  const getLocationData = () => {
    if (!analyticsData) return [];
    return analyticsData.appointmentsByLocation;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-3xl font-bold mb-6 font-poppins">Analytics Dashboard</h1>
        
        {isLoading ? (
          <p className="text-center py-8 font-montserrat">Loading analytics data...</p>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              
              {(isOrgAdmin || isSuperAdmin) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground font-montserrat">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full p-2 bg-secondary/10">
                        <Users className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold font-poppins">{analyticsData?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground font-montserrat">
                          {analyticsData?.activeUsers || 0} active this month
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-montserrat">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full p-2 bg-accent/10">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold font-poppins">{analyticsData?.appointmentsThisMonth || 0}</div>
                      <p className="text-xs text-muted-foreground font-montserrat">
                        {analyticsData && analyticsData.appointmentsLastMonth > 0 ? (
                          analyticsData.appointmentsThisMonth > analyticsData.appointmentsLastMonth ? (
                            <span className="text-green-500">↑ {Math.round((analyticsData.appointmentsThisMonth - analyticsData.appointmentsLastMonth) / analyticsData.appointmentsLastMonth * 100)}% from last month</span>
                          ) : (
                            <span className="text-red-500">↓ {Math.round((analyticsData.appointmentsLastMonth - analyticsData.appointmentsThisMonth) / analyticsData.appointmentsLastMonth * 100)}% from last month</span>
                          )
                        ) : "No data from last month"}
                      </p>
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
                    <div className="mr-4 rounded-full p-2 bg-blue-500/10">
                      <Clock className="h-6 w-6 text-blue-500" />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointments by Day of Week */}
              <Card className="col-span-1">
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
              
              {/* Appointments by Type */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="font-poppins">Appointments by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {getAppointmentTypeData().length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getAppointmentTypeData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getAppointmentTypeData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-muted-foreground font-montserrat">No appointment type data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Appointments by Location */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-poppins">Appointments by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {getLocationData().length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getLocationData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#EB459E" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-muted-foreground font-montserrat">No location data available</p>
                      </div>
                    )}
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
  <AdminProtectedRoute Component={AdminAnalyticsPage} />
);