import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { IOSButton } from "@/components/ui/ios-button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define the form schema
const formSchema = z.object({
  showTotalAppointments: z.boolean().default(true),
  showTotalRevenue: z.boolean().default(true),
  showAverageDuration: z.boolean().default(true),
  showAppointmentsByType: z.boolean().default(true),
  showTimeSeriesChart: z.boolean().default(true),
});

type AnalyticsWidgetSettings = z.infer<typeof formSchema>;

const AnalyticsWidgetSettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with default values
  const form = useForm<AnalyticsWidgetSettings>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      showTotalAppointments: true,
      showTotalRevenue: true,
      showAverageDuration: true,
      showAppointmentsByType: true,
      showTimeSeriesChart: true,
    },
  });

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would fetch the settings from the API
        // For now, we'll use default values
        const settings = {
          showTotalAppointments: true,
          showTotalRevenue: true,
          showAverageDuration: true,
          showAppointmentsByType: true,
          showTimeSeriesChart: true,
        };
        
        form.reset(settings);
      } catch (error) {
        console.error("Failed to load analytics widget settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [form, toast]);

  // Save settings
  const onSubmit = async (data: AnalyticsWidgetSettings) => {
    setIsSaving(true);
    try {
      // In a real implementation, you would save the settings to the API
      console.log("Saving analytics widget settings:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Analytics widget settings saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save analytics widget settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <IOSButton 
            variant="ghost" 
            onClick={() => navigate("/admin/settings")}
            className="ios-touch-target flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Settings
          </IOSButton>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins">Analytics Widget Settings</CardTitle>
            <CardDescription className="font-montserrat">
              Configure what information is displayed in the analytics widget on the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4 font-montserrat">Loading settings...</p>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="showTotalAppointments"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-poppins">Show Total Appointments</FormLabel>
                            <FormDescription className="font-montserrat text-sm">
                              Display the total number of appointments in the analytics widget.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="showTotalRevenue"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-poppins">Show Total Revenue</FormLabel>
                            <FormDescription className="font-montserrat text-sm">
                              Display the total revenue in the analytics widget.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="showAverageDuration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-poppins">Show Average Duration</FormLabel>
                            <FormDescription className="font-montserrat text-sm">
                              Display the average appointment duration in the analytics widget.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="showAppointmentsByType"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-poppins">Show Appointments by Type</FormLabel>
                            <FormDescription className="font-montserrat text-sm">
                              Display the breakdown of appointments by type in the analytics widget.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="showTimeSeriesChart"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-poppins">Show Time Series Chart</FormLabel>
                            <FormDescription className="font-montserrat text-sm">
                              Display the time series chart in the analytics widget.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <CardFooter className="flex justify-end px-0">
                    <IOSButton 
                      type="submit" 
                      disabled={isSaving}
                      className="ios-touch-target bg-coral text-white font-montserrat"
                    >
                      {isSaving ? "Saving..." : "Save Settings"}
                    </IOSButton>
                  </CardFooter>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute to ensure only admins can access
export default () => (
  <AdminProtectedRoute Component={AnalyticsWidgetSettingsPage} />
);