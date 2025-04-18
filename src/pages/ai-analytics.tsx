import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/route-components";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { BarChart, LineChart, PieChart, BarChart2, TrendingUp, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AIAnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [insights] = useState<string[]>([
    "Your revenue has increased by 15% compared to last month",
    "Tuesday and Thursday are your busiest days",
    "Most of your appointments are scheduled between 2PM and 5PM",
    "Therapy sessions generate 65% of your total revenue",
    "You have 3 appointments that need to be billed"
  ]);
  
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  
  useEffect(() => {
    const loadData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        // In a real implementation, we would fetch analytics data here
        // For now, we'll just simulate a loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error loading analytics data:", error);
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [session?.user?.id, toast]);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">AI-Powered Analytics</h1>
          
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
        
        {/* AI Insights */}
        <Card className="mb-6 border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-purple-700 dark:text-purple-300">
              <BarChart2 className="h-5 w-5 mr-2" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Automatically generated insights based on your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <p>Analyzing your data...</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">{index + 1}</span>
                    </div>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">24</div>
                  <p className="text-sm text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-500" />
                    Clients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">18</div>
                  <p className="text-sm text-muted-foreground">
                    Active clients
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$3,240</div>
                  <p className="text-sm text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Revenue by Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <p>Loading chart...</p>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <PieChart className="h-40 w-40 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Appointment Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <p>Loading chart...</p>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <LineChart className="h-40 w-40 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Revenue Tab */}
          <TabsContent value="revenue" className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>
                  Financial performance over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <div className="flex justify-center items-center h-full">
                  <BarChart className="h-40 w-40 text-muted-foreground" />
                  <p className="ml-4 text-muted-foreground">Financial charts will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appointments Tab */}
          <TabsContent value="appointments" className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Analytics</CardTitle>
                <CardDescription>
                  Patterns and trends in your appointment schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">Appointment analytics will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedAIAnalyticsPage = () => (
  <ProtectedRoute Component={AIAnalyticsPage} />
);

export default ProtectedAIAnalyticsPage;