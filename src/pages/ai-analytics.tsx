import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { FinancialAnalyticsDashboard } from "../components/analytics/FinancialCharts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";
import { chatApi } from "../api/chat";
import { useAuth } from "../hooks/use-auth";

// Mock data for initial state
const initialData = {
  totalRevenue: 0,
  byLocation: [],
  byUser: [],
  period: {
    startDate: 'all time',
    endDate: 'present'
  }
};

export default function AIAnalyticsPage() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState<number>(1); // Default to org ID 1
  const [timeRange, setTimeRange] = useState<string>("90days");

  // Load analytics data
  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Calculate date range based on selected time range
      const endDate = new Date().toISOString().split('T')[0];
      let startDate;
      
      switch (timeRange) {
        case "30days":
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case "90days":
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case "year":
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        default:
          startDate = undefined;
      }

      // Use the chat API to get financial analytics
      const messages = [
        { 
          role: "system" as const, 
          content: "You are a helpful assistant that can retrieve financial analytics data." 
        },
        { 
          role: "user" as const, 
          content: `Get financial analytics for organization ${organizationId}${startDate ? ` from ${startDate} to ${endDate}` : ''}.` 
        }
      ];

      const response = await chatApi.processConversation(messages);
      
      if (response.functionCall && response.functionCall.name === "getFinancialAnalytics") {
        setAnalyticsData(response.functionCall.result as typeof initialData);
      } else {
        console.error("No financial analytics data returned");
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load analytics on initial render and when filters change
  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, organizationId, timeRange]);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">AI-Powered Financial Analytics</h1>
            <p className="text-muted-foreground">
              Analyze revenue by location, user, and time period using AI
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select
              value={organizationId.toString()}
              onValueChange={(value) => setOrganizationId(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Main Organization</SelectItem>
                <SelectItem value="2">Branch Office</SelectItem>
                <SelectItem value="3">Satellite Location</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={loadAnalytics}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card className="w-full p-8">
            <div className="flex flex-col items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </Card>
        ) : (
          <FinancialAnalyticsDashboard data={analyticsData} />
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About AI-Powered Analytics</CardTitle>
            <CardDescription>
              How our AI assistant helps you understand your business performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              BookSmartly's AI assistant can analyze your appointment and revenue data to provide 
              insights about your business performance. You can ask questions like:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>"What's my total revenue for the last quarter?"</li>
              <li>"Which location is generating the most revenue?"</li>
              <li>"Who are my top-performing staff members?"</li>
              <li>"What days of the week are most profitable?"</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => window.location.href = '/chat'}
              className="w-full md:w-auto"
            >
              Chat with AI Assistant
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}