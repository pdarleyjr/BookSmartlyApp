import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStatus } from "@/hooks/use-admin";
import { adminApi } from "@/api/admin";
import { analyticsApi } from "@/api/analytics";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { IOSButton } from "@/components/ui/ios-button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, DollarSign } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { fine } from "@/lib/fine";
import type { Schema } from "@/lib/db-types";

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Define types for analytics data
interface AnalyticsMetrics {
  total: number;
  completed: number;
  upcoming: number;
  revenue: number;
  averageDuration: number;
}

interface TimeSeriesData {
  date: string;
  count: number;
  revenue: number;
}

interface AppointmentByType {
  typeId: number;
  typeName: string;
  count: number;
  revenue: number;
}

interface AppointmentByLocation {
  locationId: number;
  locationName: string;
  count: number;
  revenue: number;
}

interface AppointmentByUser {
  userId: string;
  userName: string;
  count: number;
  revenue: number;
}

interface AnalyticsData {
  metrics: AnalyticsMetrics;
  timeSeriesData: TimeSeriesData[];
  appointmentsByType: AppointmentByType[];
  appointmentsByLocation: AppointmentByLocation[];
  appointmentsByUser: AppointmentByUser[];
}

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const { isAdmin, isSuperAdmin, isOrgAdmin, organizationId, isOrgApproved, isLoading: isAdminLoading } = useAdminStatus();
  
  const [organizations, setOrganizations] = useState<Schema["organizations"][]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'30' | '90' | '180' | '365'>('90');
  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('day');
  
  // Redirect non-admin users or unapproved users
  useEffect(() => {
    if (!isAdminLoading) {
      if (!isAdmin && !isSuperAdmin && !isOrgAdmin && session?.user?.email !== 'pdarleyjr@gmail.com') {
        navigate('/');
        toast({
          title: "Access Denied",
          description: "You don't have permission to view analytics.",
          variant: "destructive"
        });
      } else if (isOrgAdmin && !isOrgApproved) {
        navigate('/');
        toast({
          title: "Access Pending",
          description: "Your organization access is pending approval.",
          variant: "destructive"
        });
      }
    }
  }, [isAdmin, isSuperAdmin, isOrgAdmin, isOrgApproved, isAdminLoading, navigate, toast, session?.user?.email]);
  
  // Fetch organizations for super admin
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (isSuperAdmin) {
        try {
          const orgs = await adminApi.getAllOrganizations();
          setOrganizations(orgs);
          
          // If organizations are available and no org is selected yet, select the first one
          if (orgs.length > 0 && !selectedOrgId) {
            setSelectedOrgId(orgs[0].id!);
          }
        } catch (error) {
          console.error('Error fetching organizations:', error);
          toast({
            title: "Error",
            description: "Failed to load organizations. Please try again.",
            variant: "destructive"
          });
        }
      } else if (organizationId) {
        // For regular admin, use their organization
        setSelectedOrgId(organizationId);
      }
    };
    
    fetchOrganizations();
  }, [isSuperAdmin, organizationId, selectedOrgId, toast]);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.user?.id || isAdminLoading) {
        return;
      }
      
      if (!isAdmin && !isSuperAdmin && !isOrgAdmin && session?.user?.email !== 'pdarleyjr@gmail.com') {
        return;
      }
      
      if (!selectedOrgId) {
        console.log("No organization selected");
        setAnalytics(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));
        
        // Fetch real analytics data from the API
        const data = await analyticsApi.getOrganizationAnalytics(
          selectedOrgId,
          startDate,
          endDate,
          interval
        );
        
        if (data) {
          // Convert the API response to our component's expected format
          const analyticsData: AnalyticsData = {
            metrics: data.metrics,
            timeSeriesData: data.timeSeriesData,
            appointmentsByType: data.appointmentsByType,
            appointmentsByLocation: data.appointmentsByLocation,
            appointmentsByUser: data.appointmentsByUser
          };
          
          setAnalytics(analyticsData);
        } else {
          setAnalytics(null);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive"
        });
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [session?.user?.id, dateRange, interval, isAdmin, isSuperAdmin, isOrgAdmin, isAdminLoading, selectedOrgId, toast, session?.user?.email]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Format time duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };
  
  // If not an admin or not approved, don't render the page
  if (
    (!isAdmin && !isSuperAdmin && !isOrgAdmin && !isAdminLoading && session?.user?.email !== 'pdarleyjr@gmail.com') ||
    (isOrgAdmin && !isOrgApproved && !isAdminLoading)
  ) {
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              View and analyze your organization's performance
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Organization selector for super admin */}
            {isSuperAdmin && (
              <Select
                value={selectedOrgId?.toString() || ""}
                onValueChange={(value) => setSelectedOrgId(parseInt(value))}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id!.toString()}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Select
              value={dateRange}
              onValueChange={(value) => setDateRange(value as '30' | '90' | '180' | '365')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 180 days</SelectItem>
                <SelectItem value="365">Last 365 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={interval}
              onValueChange={(value) => setInterval(value as 'day' | 'week' | 'month')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading || isAdminLoading ? (
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
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                    Total Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800">{analytics.metrics.total}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.metrics.completed} completed, {analytics.metrics.upcoming} upcoming
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800">{formatCurrency(analytics.metrics.revenue)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg. {formatCurrency(analytics.metrics.total > 0 ? analytics.metrics.revenue / analytics.metrics.total : 0)} per appointment
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-orange-500" />
                    Average Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800">{formatDuration(analytics.metrics.averageDuration)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Per appointment
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Time Series Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Appointments Over Time</CardTitle>
                <CardDescription>
                  View appointment trends and revenue over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.timeSeriesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => {
                          return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'revenue') {
                            return [formatCurrency(value as number), 'Revenue'];
                          }
                          return [value, name === 'count' ? 'Appointments' : name];
                        }}
                        labelFormatter={(label) => {
                          return new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="count"
                        name="Appointments"
                        stroke="#0088FE"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#00C49F"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Detailed Analytics Tabs */}
            <Tabs defaultValue="appointment-types" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="appointment-types">Appointment Types</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="staff">Staff Members</TabsTrigger>
              </TabsList>
              
              {/* Appointment Types Tab */}
              <TabsContent value="appointment-types">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Types</CardTitle>
                    <CardDescription>
                      Breakdown of appointments by type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.appointmentsByType}
                              dataKey="count"
                              nameKey="typeName"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ typeName, percent }) => `${typeName}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {analytics.appointmentsByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name, props) => {
                                return [`${value} appointments`, props.payload.typeName];
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analytics.appointmentsByType}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="typeName" width={150} />
                            <Tooltip
                              formatter={(value, name) => {
                                if (name === 'revenue') {
                                  return [formatCurrency(value as number), 'Revenue'];
                                }
                                return [value, name === 'count' ? 'Appointments' : name];
                              }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#00C49F" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Type</th>
                            <th className="text-right py-3 px-4">Appointments</th>
                            <th className="text-right py-3 px-4">Revenue</th>
                            <th className="text-right py-3 px-4">Avg. Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.appointmentsByType.map((type) => (
                            <tr key={type.typeId} className="border-b">
                              <td className="py-3 px-4">{type.typeName}</td>
                              <td className="text-right py-3 px-4">{type.count}</td>
                              <td className="text-right py-3 px-4">{formatCurrency(type.revenue)}</td>
                              <td className="text-right py-3 px-4">
                                {formatCurrency(type.count > 0 ? type.revenue / type.count : 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  {(isAdmin || isSuperAdmin || isOrgAdmin) && (
                    <CardFooter>
                      <IOSButton
                        onClick={() => navigate("/settings/appointment-types")}
                        variant="outline"
                        className="ml-auto"
                      >
                        Manage Appointment Types
                      </IOSButton>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
              
              {/* Locations Tab */}
              <TabsContent value="locations">
                <Card>
                  <CardHeader>
                    <CardTitle>Locations</CardTitle>
                    <CardDescription>
                      Breakdown of appointments by location
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.appointmentsByLocation}
                              dataKey="count"
                              nameKey="locationName"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ locationName, percent }) => `${locationName}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {analytics.appointmentsByLocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name, props) => {
                                return [`${value} appointments`, props.payload.locationName];
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analytics.appointmentsByLocation}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="locationName" width={150} />
                            <Tooltip
                              formatter={(value, name) => {
                                if (name === 'revenue') {
                                  return [formatCurrency(value as number), 'Revenue'];
                                }
                                return [value, name === 'count' ? 'Appointments' : name];
                              }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#FFBB28" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Location</th>
                            <th className="text-right py-3 px-4">Appointments</th>
                            <th className="text-right py-3 px-4">Revenue</th>
                            <th className="text-right py-3 px-4">Avg. Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.appointmentsByLocation.map((location) => (
                            <tr key={location.locationId} className="border-b">
                              <td className="py-3 px-4">{location.locationName}</td>
                              <td className="text-right py-3 px-4">{location.count}</td>
                              <td className="text-right py-3 px-4">{formatCurrency(location.revenue)}</td>
                              <td className="text-right py-3 px-4">
                                {formatCurrency(location.count > 0 ? location.revenue / location.count : 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  {(isAdmin || isSuperAdmin || isOrgAdmin) && (
                    <CardFooter>
                      <IOSButton
                        onClick={() => navigate("/settings/locations")}
                        variant="outline"
                        className="ml-auto"
                      >
                        Manage Locations
                      </IOSButton>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
              
              {/* Staff Tab */}
              <TabsContent value="staff">
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Members</CardTitle>
                    <CardDescription>
                      Breakdown of appointments by staff member
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.appointmentsByUser}
                              dataKey="count"
                              nameKey="userName"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ userName, percent }) => `${userName}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {analytics.appointmentsByUser.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name, props) => {
                                return [`${value} appointments`, props.payload.userName];
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analytics.appointmentsByUser}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="userName" width={150} />
                            <Tooltip
                              formatter={(value, name) => {
                                if (name === 'revenue') {
                                  return [formatCurrency(value as number), 'Revenue'];
                                }
                                return [value, name === 'count' ? 'Appointments' : name];
                              }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#FF8042" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Staff Member</th>
                            <th className="text-right py-3 px-4">Appointments</th>
                            <th className="text-right py-3 px-4">Revenue</th>
                            <th className="text-right py-3 px-4">Avg. Revenue</th>
                            <th className="text-right py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.appointmentsByUser.map((user) => (
                            <tr key={user.userId} className="border-b">
                              <td className="py-3 px-4">{user.userName}</td>
                              <td className="text-right py-3 px-4">{user.count}</td>
                              <td className="text-right py-3 px-4">{formatCurrency(user.revenue)}</td>
                              <td className="text-right py-3 px-4">
                                {formatCurrency(user.count > 0 ? user.revenue / user.count : 0)}
                              </td>
                              <td className="text-right py-3 px-4">
                                <IOSButton
                                  onClick={() => navigate(`/users/${user.userId}`)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  View Details
                                </IOSButton>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No analytics data available for your organization.</p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AnalyticsDashboard;
