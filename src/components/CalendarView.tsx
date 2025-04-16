import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Schema } from "@/lib/db-types";
import { useIsMobile } from "@/hooks/use-mobile";

type ViewMode = "day" | "week" | "month";

type CalendarViewProps = {
  appointments: Schema["appointments"][];
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  isCompact?: boolean;
  initialView?: ViewMode;
};

export function CalendarView({
  appointments,
  onDateSelect,
  selectedDate,
  isCompact = false,
  initialView
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>(initialView || "month");
  const isMobile = useIsMobile();
  
  // Switch to day view on mobile by default
  useEffect(() => {
    if (isMobile && !initialView) {
      setViewMode("day");
    }
  }, [isMobile, initialView]);
  
  // Get days for the current month plus padding days from previous/next months
  const getDaysToDisplay = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };
  
  const daysToDisplay = getDaysToDisplay();

  // Navigation functions
  const previousPeriod = () => {
    if (viewMode === "month") {
      setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
    } else if (viewMode === "week") {
      setCurrentWeek(prevWeek => subWeeks(prevWeek, 1));
    } else if (viewMode === "day") {
      onDateSelect(addDays(selectedDate, -1));
    }
  };

  const nextPeriod = () => {
    if (viewMode === "month") {
      setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
    } else if (viewMode === "week") {
      setCurrentWeek(prevWeek => addWeeks(prevWeek, 1));
    } else if (viewMode === "day") {
      onDateSelect(addDays(selectedDate, 1));
    }
  };

  const hasAppointmentOnDay = (day: Date) => {
    return appointments.some(appointment => {
      try {
        const appointmentDate = parseISO(appointment.startTime);
        return isSameDay(appointmentDate, day);
      } catch {
        return false;
      }
    });
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => {
      try {
        const appointmentDate = parseISO(appointment.startTime);
        return isSameDay(appointmentDate, day);
      } catch {
        return false;
      }
    });
  };

  // Determine if a day is in the current month
  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentMonth.getMonth();
  };

  // Render the day view
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDay(selectedDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold font-poppins">
            {format(selectedDate, "EEEE, MMMM d")}
          </h3>
          {isToday(selectedDate) && (
            <span className="text-sm text-muted-foreground">Today</span>
          )}
        </div>
        
        {dayAppointments.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground font-montserrat">
              No appointments scheduled for this day
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayAppointments
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map((appointment, idx) => {
                const startTime = parseISO(appointment.startTime);
                const endTime = parseISO(appointment.endTime);
                
                return (
                  <div
                    key={appointment.id || idx}
                    className="bg-white rounded-xl p-4 shadow-sm border border-muted active:scale-95 transition-transform"
                    onClick={() => onDateSelect(startTime)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold font-poppins">{appointment.title}</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                      </span>
                    </div>
                    
                    {appointment.location && (
                      <div className="text-sm text-muted-foreground mb-1">
                        📍 {appointment.location}
                      </div>
                    )}
                    
                    {appointment.description && (
                      <p className="text-sm mt-2 line-clamp-2">{appointment.description}</p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  };
  
  // Render the week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentWeek);
    const weekEnd = endOfWeek(currentWeek);
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold font-poppins">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h3>
        </div>
        
        <div className="space-y-4">
          {daysInWeek.map(day => {
            const dayAppointments = getAppointmentsForDay(day);
            const isSelectedDay = isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            
            return (
              <div key={day.toString()} className="space-y-2">
                <button
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-lg font-poppins flex items-center justify-between ios-touch-target active:scale-95 transition-transform",
                    isSelectedDay ? "bg-primary text-white" : isDayToday ? "bg-muted border border-primary" : "bg-muted"
                  )}
                  onClick={() => onDateSelect(day)}
                >
                  <div className="flex items-center">
                    <span className="font-semibold">{format(day, "EEE")}</span>
                    <span className="ml-2">{format(day, "MMM d")}</span>
                  </div>
                  {dayAppointments.length > 0 && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {dayAppointments.length} {dayAppointments.length === 1 ? "appt" : "appts"}
                    </span>
                  )}
                </button>
                
                {isSelectedDay && dayAppointments.length > 0 && (
                  <div className="pl-4 space-y-2">
                    {dayAppointments
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((appointment, idx) => {
                        const startTime = parseISO(appointment.startTime);
                        
                        return (
                          <div
                            key={appointment.id || idx}
                            className="flex items-center p-2 rounded-lg bg-white border border-muted active:scale-95 transition-transform"
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{appointment.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(startTime, "h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render the month view (original calendar grid)
  const renderMonthView = () => {
    return (
      <>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-xs font-medium text-muted-foreground py-1 font-poppins">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {daysToDisplay.map((day) => {
            const hasAppointment = hasAppointmentOnDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            const isOtherMonth = !isCurrentMonth(day);
            const dayAppointments = getAppointmentsForDay(day);
            
            return (
              <button
                key={day.toString()}
                className={cn(
                  "ios-touch-target flex flex-col items-center justify-start relative active:scale-95 transition-transform",
                  isCompact ? "h-11" : "h-20 p-1",
                  isSelected && "bg-primary text-white rounded-lg",
                  !isSelected && isDayToday && "border border-primary rounded-lg",
                  !isSelected && !isDayToday && "hover:bg-muted rounded-lg",
                  isOtherMonth && "opacity-40"
                )}
                onClick={() => onDateSelect(day)}
              >
                <time dateTime={format(day, "yyyy-MM-dd")} className={cn(
                  "text-sm w-7 h-7 flex items-center justify-center rounded-full",
                  isSelected && "font-bold",
                  !isCompact && "mb-1"
                )}>
                  {format(day, "d")}
                </time>
                
                {!isCompact && dayAppointments.length > 0 && (
                  <div className="w-full px-0.5 overflow-hidden">
                    {dayAppointments.slice(0, 2).map((apt, idx) => (
                      <div
                        key={apt.id || idx}
                        className={cn(
                          "text-xs truncate rounded px-1 mb-0.5",
                          isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                        )}
                        title={apt.title}
                      >
                        {apt.title}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-center">
                        +{dayAppointments.length - 2} more
                      </div>
                    )}
                  </div>
                )}
                
                {isCompact && hasAppointment && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className={cn(
      "w-full ios-card p-4",
      isCompact ? "h-auto" : "h-full min-h-[600px]"
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center justify-between">
          <h2 className={cn(
            "font-poppins font-semibold",
            isCompact ? "text-xl" : "text-2xl"
          )}>
            {viewMode === "month" && format(currentMonth, "MMMM yyyy")}
            {viewMode === "week" && `Week of ${format(currentWeek, "MMM d")}`}
            {viewMode === "day" && format(selectedDate, "MMMM d")}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousPeriod}
              className="ios-touch-target flex items-center justify-center rounded-full bg-muted w-10 h-10 active:scale-95 transition-transform"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextPeriod}
              className="ios-touch-target flex items-center justify-center rounded-full bg-muted w-10 h-10 active:scale-95 transition-transform"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* View mode selector */}
        <div className="flex rounded-lg overflow-hidden border">
          <button
            onClick={() => setViewMode("day")}
            className={cn(
              "px-4 py-2 text-sm font-medium ios-touch-target active:scale-95 transition-transform min-w-[44px] h-[44px]",
              viewMode === "day" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
            )}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={cn(
              "px-4 py-2 text-sm font-medium ios-touch-target active:scale-95 transition-transform min-w-[44px] h-[44px]",
              viewMode === "week" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
            )}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={cn(
              "px-4 py-2 text-sm font-medium ios-touch-target active:scale-95 transition-transform min-w-[44px] h-[44px]",
              viewMode === "month" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
            )}
          >
            Month
          </button>
        </div>
      </div>
      
      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}
    </div>
  );
}