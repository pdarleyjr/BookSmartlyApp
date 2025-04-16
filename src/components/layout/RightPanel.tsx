import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Calendar, Clock, Users } from "lucide-react";
import { fine } from "@/lib/fine";
import { useAppSelector } from "@/redux/hooks";
import { format, parseISO, startOfMonth, endOfMonth, differenceInMinutes } from "date-fns";

export function RightPanel() {
  const [activeTab, setActiveTab] = useState("analytics");
  const { data: session } = fine.auth.useSession();
  const appointments = useAppSelector(state => state.appointments.items);
  
  if (!session?.user) return null;
  
  // Calculate analytics data
  const totalAppointments = appointments.length;
  
  const currentMonth = new Date();
  const startOfCurrentMonth = startOfMonth(currentMonth);
  const endOfCurrentMonth = endOfMonth(currentMonth);
  
  const appointmentsThisMonth = appointments.filter(appointment => {
    try {
      const appointmentDate = parseISO(appointment.startTime);
      return appointmentDate >= startOfCurrentMonth && appointmentDate <= endOfCurrentMonth;
    } catch (e) {
      return false;
    }
  });
  
  const totalDurationMinutes = appointments.reduce((total, appointment) => {
    try {
      const startTime = parseISO(appointment.startTime);
      const endTime = parseISO(appointment.endTime);
      return total + differenceInMinutes(endTime, startTime);
    } catch (e) {
      return total;
    }
  }, 0);
  
  const averageDurationMinutes = totalAppointments > 0 ? Math.round(totalDurationMinutes / totalAppointments) : 0;
  
  return (
    <div className="w-80 border-l bg-background p-4 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center mr-3">
                    <Calendar className="h-4 w-4 text-coral" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Appointments</p>
                    <p className="text-lg font-semibold">{totalAppointments}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue/20 flex items-center justify-center mr-3">
                    <Calendar className="h-4 w-4 text-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-lg font-semibold">{appointmentsThisMonth.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow/20 flex items-center justify-center mr-3">
                    <Clock className="h-4 w-4 text-yellow" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Duration</p>
                    <p className="text-lg font-semibold">{averageDurationMinutes} min</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.slice(0, 3).map((appointment, index) => (
                  <div key={appointment.id || index} className="border-b pb-2 last:border-0 last:pb-0">
                    <p className="font-medium">{appointment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(appointment.startTime), "MMM d, h:mm a")}
                    </p>
                  </div>
                ))}
                
                {appointments.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recent appointments</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-coral flex items-center justify-center text-white text-xl">
                  {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-center">
                  <p className="font-semibold">{session.user.name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <span className="text-sm font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">
                    {format(new Date(), "MMM yyyy")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">You're currently on the <span className="font-medium">Free Plan</span></p>
                <p className="text-sm text-muted-foreground">Upgrade to access premium features</p>
                <button className="w-full bg-coral text-white rounded-lg py-2 mt-2 text-sm font-medium">
                  Upgrade Plan
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}