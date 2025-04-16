import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { analyticsApi } from "@/api/analytics";
import { useAdminStatus } from "@/hooks/use-admin";
import { adminApi } from "@/api/admin";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Calendar, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { IOSButton } from "@/components/ui/ios-button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schema } from "@/lib/db-types";

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const UserAnalyticsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organizationId } = useAdminStatus();
  const { id } = useParams<{ id: string }>();
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [userData, setUserData] = useState<Schema["users"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'30' | '90' | '180' | '365'>('90');
  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('day');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !organizationId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch user details
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
        console.error("Error fetching user analytics:", error);
        toast({
          title: "Error",
          description: "Failed to load user analytics data. Please try again.",
          variant: "destructive"
        });
        navigate("/admin/analytics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, organizationId, toast, navigate]);
  
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
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <IOSButton
                onClick={() => navigate("/admin/analytics")}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
              </IOSButton>
            </div>
            
            <h1 className="text-3xl font-bold font-montserrat">
              {isLoading ? (
                <Skeleton className="h-9 w-64" />
              ) : (
                `${userData?.name || userData?.email || 'User'} Analytics`
              )}
            </h1>
            <p className="text-muted-foreground font-montserrat mt-1">
              {isLoading ? (
                <Skeleton className="h-5 w-96" />
              ) : (
                `Performance metrics for ${userData?.email || 'this user'}`
              )}
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analyticsData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Total Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData.totalAppointments}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData.appointmentsThisMonth}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Average Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData.averageDuration}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minutes per appointment
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Appointments by Day of Week</CardTitle>
                <CardDescription>
                  Distribution of appointments across different days of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getDayOfWeekData()}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
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
            
            {/* Appointment Types */}
            {analyticsData.appointmentsByType && analyticsData.appointmentsByType.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Appointment Types</CardTitle>
                  <CardDescription>
                    Breakdown of appointments by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.appointmentsByType}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {analyticsData.appointmentsByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => {
                            return [`${value} appointments`, props.payload.name];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Type</th>
                          <th className="text-right py-3 px-4">Appointments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.appointmentsByType.map((type) => (
                          <tr key={type.name} className="border-b">
                            <td className="py-3 px-4">{type.name}</td>
                            <td className="text-right py-3 px-4">{type.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No analytics data available for this user.</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute to ensure only admins can access
export default () => (
  <AdminProtectedRoute Component={UserAnalyticsPage} />
);
