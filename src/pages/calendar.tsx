import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Layout } from "@/components/layout/Layout";
import { CalendarView } from "@/components/CalendarView";
import { IOSButton } from "@/components/ui/ios-button";
import { Plus, Calendar as CalendarIcon, Check, Clock, RefreshCcw, UserX } from "lucide-react";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAppointments, fetchAppointmentsByDateRange, setSelectedDate, updateAppointment } from "@/redux/slices/appointmentsSlice";
import { ProtectedRoute } from "@/components/auth/route-components";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Schema } from "@/lib/db-types";

const CalendarPage = () => {
  const [selectedDate, setSelectedDateState] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("calendar");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Schema["appointments"] | null>(null);
  const [appointmentStatus, setAppointmentStatus] = useState<"scheduled" | "arrived" | "completed" | "cancelled" | "no-show">("scheduled");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(state => state.appointments.items);
  
  // Get appointments for the selected date
  const appointmentsForSelectedDate = appointments.filter(appointment => {
    try {
      const appointmentDate = new Date(appointment.startTime);
      return (
        appointmentDate.getDate() === selectedDate.getDate() &&
        appointmentDate.getMonth() === selectedDate.getMonth() &&
        appointmentDate.getFullYear() === selectedDate.getFullYear()
      );
    } catch {
      return false;
    }
  }).sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Group appointments by status
  const appointmentsByStatus = {
    scheduled: appointmentsForSelectedDate.filter(a => !a.status || a.status === "scheduled"),
    arrived: appointmentsForSelectedDate.filter(a => a.status === "arrived"),
    completed: appointmentsForSelectedDate.filter(a => a.status === "completed"),
    cancelled: appointmentsForSelectedDate.filter(a => a.status === "cancelled"),
    noShow: appointmentsForSelectedDate.filter(a => a.status === "no-show")
  };

  useEffect(() => {
    const loadAppointments = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all appointments for the user
        await dispatch(fetchAppointments(session.user.id)).unwrap();
        
        // Also fetch appointments for the current month range
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        
        await dispatch(fetchAppointmentsByDateRange({
          userId: session.user.id,
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString()
        })).unwrap();
      } catch {
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppointments();
  }, [session?.user?.id, dispatch]);

  const handleDateSelect = (date: Date) => {
    setSelectedDateState(date);
    dispatch(setSelectedDate(date.toISOString()));
    
    // When selecting a date in a different month, fetch appointments for that month
    if (date.getMonth() !== selectedDate.getMonth() && session?.user?.id) {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      dispatch(fetchAppointmentsByDateRange({
        userId: session.user.id,
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString()
      }));
    }
  };

  const handleRefresh = () => {
    if (session?.user?.id) {
      dispatch(fetchAppointments(session.user.id));
    }
  };

  const openStatusDialog = (appointment: Schema["appointments"]) => {
    setSelectedAppointment(appointment);
    setAppointmentStatus(appointment.status || "scheduled");
    setStatusDialogOpen(true);
  };

  const updateAppointmentStatus = async () => {
    if (!selectedAppointment || !session?.user?.id) return;
    
    try {
      await dispatch(updateAppointment({
        id: selectedAppointment.id!,
        userId: session.user.id,
        appointment: { status: appointmentStatus }
      })).unwrap();
      
      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${appointmentStatus}`,
      });
      
      setStatusDialogOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "arrived":
        return <Badge className="bg-blue-500">Arrived</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case "no-show":
        return <Badge className="bg-amber-500">No Show</Badge>;
      default:
        return <Badge className="bg-slate-500">Scheduled</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-poppins">Calendar</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <IOSButton
              onClick={() => navigate("/create-appointment")}
              className="ios-touch-target"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </IOSButton>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="schedule">Schedule View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="w-full">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Calendar Column - Expanded to take more space */}
              <div className="w-full lg:w-8/12">
                <CalendarView
                  appointments={appointments}
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                  isCompact={false}
                />
              </div>
              
              {/* Appointments Column */}
              <div className="w-full lg:w-4/12">
                <Card>
                  <CardHeader>
                    <CardTitle>{format(selectedDate, "MMMM d, yyyy")}</CardTitle>
                    <CardDescription>
                      {appointmentsForSelectedDate.length} appointment{appointmentsForSelectedDate.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p className="text-center py-8 font-montserrat">Loading appointments...</p>
                    ) : appointmentsForSelectedDate.length > 0 ? (
                      <div className="space-y-4">
                        {appointmentsForSelectedDate.map((appointment) => (
                          <div key={appointment.id} className="flex flex-col p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">{appointment.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(appointment.startTime), "h:mm a")} - {format(new Date(appointment.endTime), "h:mm a")}
                                </p>
                              </div>
                              {getStatusBadge(appointment.status)}
                            </div>
                            
                            {appointment.clientName && (
                              <p className="text-sm mb-2">Client: {appointment.clientName}</p>
                            )}
                            
                            {appointment.location && (
                              <p className="text-sm mb-2">Location: {appointment.location}</p>
                            )}
                            
                            <div className="flex justify-between mt-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openStatusDialog(appointment)}
                              >
                                Update Status
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate(`/appointment/${appointment.id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium mb-2 font-poppins">No appointments</h3>
                        <p className="text-muted-foreground mb-4 font-montserrat">
                          No appointments scheduled for this day.
                        </p>
                        <IOSButton
                          onClick={() => navigate("/create-appointment")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Appointment
                        </IOSButton>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Scheduled Appointments */}
              <Card>
                <CardHeader className="bg-slate-100 dark:bg-slate-800">
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Scheduled
                  </CardTitle>
                  <CardDescription>
                    {appointmentsByStatus.scheduled.length} appointment{appointmentsByStatus.scheduled.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {appointmentsByStatus.scheduled.length > 0 ? (
                    <div className="space-y-3">
                      {appointmentsByStatus.scheduled.map(appointment => (
                        <div key={appointment.id} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{appointment.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(appointment.startTime), "h:mm a")}
                              </p>
                              {appointment.clientName && (
                                <p className="text-sm">{appointment.clientName}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-green-500"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setAppointmentStatus("arrived");
                                  updateAppointmentStatus();
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-red-500"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setAppointmentStatus("no-show");
                                  updateAppointmentStatus();
                                }}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No scheduled appointments</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Arrived Appointments */}
              <Card>
                <CardHeader className="bg-blue-100 dark:bg-blue-900">
                  <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                    <Check className="h-5 w-5 mr-2" />
                    Arrived
                  </CardTitle>
                  <CardDescription>
                    {appointmentsByStatus.arrived.length} appointment{appointmentsByStatus.arrived.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {appointmentsByStatus.arrived.length > 0 ? (
                    <div className="space-y-3">
                      {appointmentsByStatus.arrived.map(appointment => (
                        <div key={appointment.id} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{appointment.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(appointment.startTime), "h:mm a")}
                              </p>
                              {appointment.clientName && (
                                <p className="text-sm">{appointment.clientName}</p>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setAppointmentStatus("completed");
                                updateAppointmentStatus();
                              }}
                            >
                              Complete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No arrived clients</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Completed Appointments */}
              <Card>
                <CardHeader className="bg-green-100 dark:bg-green-900">
                  <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                    <Check className="h-5 w-5 mr-2" />
                    Completed
                  </CardTitle>
                  <CardDescription>
                    {appointmentsByStatus.completed.length} appointment{appointmentsByStatus.completed.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {appointmentsByStatus.completed.length > 0 ? (
                    <div className="space-y-3">
                      {appointmentsByStatus.completed.map(appointment => (
                        <div key={appointment.id} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{appointment.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(appointment.startTime), "h:mm a")}
                              </p>
                              {appointment.clientName && (
                                <p className="text-sm">{appointment.clientName}</p>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/billing?appointmentId=${appointment.id}`)}
                            >
                              Bill
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No completed appointments</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>
              Change the status of this appointment.
            </DialogDescription>
          </DialogHeader>
          
          <Select
            value={appointmentStatus}
            onValueChange={(value: "scheduled" | "arrived" | "completed" | "cancelled" | "no-show") =>
              setAppointmentStatus(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="arrived">Arrived</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateAppointmentStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedCalendarPage = () => (
  <ProtectedRoute Component={CalendarPage} />
);

export default ProtectedCalendarPage;