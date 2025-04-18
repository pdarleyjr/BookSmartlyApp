import { useState } from "react";
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
    } catch {
      return false;
    }
  });
  
  const totalDurationMinutes = appointments.reduce((total, appointment) => {
    try {
      const startTime = parseISO(appointment.startTime);
      const endTime = parseISO(appointment.endTime);
      return total + differenceInMinutes(endTime, startTime);
    } catch {
      return total;
    }
  }, 0);
  
  const averageDurationMinutes = totalAppointments > 0 ? Math.round(totalDurationMinutes / totalAppointments) : 0;
  
  return (
    <div className="w-72 border-l border-discord-backgroundModifierAccent glass-card-dark p-4 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto shadow-discord">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-discord-backgroundModifierHover">
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gradient-blurple data-[state=active]:text-white"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-gradient-fuchsia data-[state=active]:text-white"
          >
            Profile
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="glass-card rounded-discord p-4 shadow-glass">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-discord-textNormal">Overview</h3>
              <BarChart className="h-4 w-4 text-discord-textMuted" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-blurple flex items-center justify-center mr-3 shadow-inner-glow">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-discord-textMuted">Total Appointments</p>
                  <p className="text-lg font-semibold text-discord-textNormal">{totalAppointments}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-blue-cyan flex items-center justify-center mr-3 shadow-inner-glow">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-discord-textMuted">This Month</p>
                  <p className="text-lg font-semibold text-discord-textNormal">{appointmentsThisMonth.length}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-cyan-green flex items-center justify-center mr-3 shadow-inner-glow">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-discord-textMuted">Avg. Duration</p>
                  <p className="text-lg font-semibold text-discord-textNormal">{averageDurationMinutes} min</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-discord p-4 shadow-glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-discord-textNormal">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {appointments.slice(0, 3).map((appointment, index) => (
                <div
                  key={appointment.id || index}
                  className="border-b border-discord-backgroundModifierAccent pb-3 last:border-0 last:pb-0 hover:bg-discord-backgroundModifierHover p-2 rounded-md transition-colors"
                >
                  <p className="font-medium text-discord-textNormal">{appointment.title}</p>
                  <p className="text-sm text-discord-textMuted">
                    {format(parseISO(appointment.startTime), "MMM d, h:mm a")}
                  </p>
                </div>
              ))}
              
              {appointments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6">
                  <Calendar className="h-12 w-12 text-discord-textMuted mb-2 opacity-50" />
                  <p className="text-sm text-discord-textMuted">No recent appointments</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-4 mt-4">
          <div className="glass-card rounded-discord p-4 shadow-glass">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-discord-textNormal">User Profile</h3>
              <Users className="h-4 w-4 text-discord-textMuted" />
            </div>
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="w-20 h-20 rounded-full bg-gradient-purple-pink flex items-center justify-center text-white text-2xl shadow-discord">
                {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-center">
                <p className="font-semibold text-discord-textNormal">{session.user.name || "User"}</p>
                <p className="text-sm text-discord-textMuted">{session.user.email}</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-3 bg-discord-backgroundModifierHover p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-discord-textMuted">Account Type</span>
                <span className="text-sm font-medium text-discord-textNormal">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-discord-textMuted">Member Since</span>
                <span className="text-sm font-medium text-discord-textNormal">
                  {format(new Date(), "MMM yyyy")}
                </span>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-discord p-4 shadow-glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-discord-textNormal">Subscription</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-discord-backgroundModifierHover p-3 rounded-lg">
                <p className="text-sm text-discord-textNormal">You're currently on the <span className="font-medium text-discord-blurple">Free Plan</span></p>
                <p className="text-sm text-discord-textMuted mt-1">Upgrade to access premium features</p>
              </div>
              <button className="w-full bg-gradient-blurple text-white rounded-lg py-3 text-sm font-medium shadow-discord active:scale-95 transition-transform">
                Upgrade Plan
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}