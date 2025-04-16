import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminStatus } from "@/hooks/use-admin";
import { analyticsApi, type LocationAnalytics } from "@/api/analytics";
import { locationsApi } from "@/api/locations";
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
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
import { Calendar, Clock, DollarSign, ArrowLeft, MapPin } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import type { Schema } from "@/lib/db-types";

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const LocationAnalyticsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organizationId } = useAdminStatus();
  const { id } = useParams<{ id: string }>();
  const locationId = id ? parseInt(id) : undefined;
  
  const [analytics, setAnalytics] = useState<LocationAnalytics | null>(null);
  const [location, setLocation] = useState<Schema["locations"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'30' | '90' | '180' | '365'>('90');
  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('day');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!locationId || !organizationId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch location details
        const locationData = await locationsApi.getLocationById(locationId);
        setLocation(locationData);
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));
        
        // Fetch analytics
        const analyticsData = await analyticsApi.getLocationAnalytics(
          locationId,
          startDate,
          endDate,
          interval
        );
        
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Error fetching location analytics:", error);
        toast({
          title: "Error",
          description: "Failed to load location analytics data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [locationId, organizationId, dateRange, interval, toast]);
  
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
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
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
                `${location?.name || 'Location'} Analytics`
              )}
            </h1>
            <p className="text-muted-foreground font-montserrat mt-1">
              {isLoading ? (
                <Skeleton className="h-5 w-96" />
              ) : (
                `Performance metrics for ${location?.address || 'this location'}`
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
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
        ) : analytics ? (
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
                  <div className="text-3xl font-bold">{analytics.metrics.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.metrics.completed} completed, {analytics.metrics.upcoming} upcoming
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(analytics.metrics.revenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg. {formatCurrency(analytics.metrics.total > 0 ? analytics.metrics.revenue / analytics.metrics.total : 0)} per appointment
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
                  <div className="text-3xl font-bold">{formatDuration(analytics.metrics.averageDuration)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per appointment
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Location Details */}
            {location && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Address</h3>
                      <p className="text-muted-foreground">
                        {location.address || 'No address provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Utilization</h3>
                      <p className="text-muted-foreground">
                        {analytics.metrics.total} appointments in the selected period
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
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
                          if (interval === 'day') {
                            return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          } else if (interval === 'week') {
                            return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          } else {
                            return new Date(date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                          }
                        }}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'Revenue') {
                            return [formatCurrency(value as number), name];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label) => {
                          if (interval === 'day') {
                            return new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                          } else if (interval === 'week') {
                            return `Week of ${new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
                          } else {
                            return new Date(label + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                          }
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
            
            {/* Appointment Types */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Appointment Types</CardTitle>
                <CardDescription>
                  Breakdown of appointments by type at this location
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
            </Card>
          </>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No analytics data available for this location.</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default LocationAnalyticsPage;