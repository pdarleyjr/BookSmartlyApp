import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Schema } from "@/lib/db-types";

type CalendarViewProps = {
  appointments: Schema["appointments"][];
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  isCompact?: boolean;
};

export function CalendarView({ appointments, onDateSelect, selectedDate, isCompact = false }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get days for the current month plus padding days from previous/next months
  const getDaysToDisplay = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };
  
  const daysToDisplay = getDaysToDisplay();

  const previousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const hasAppointmentOnDay = (day: Date) => {
    return appointments.some(appointment => {
      try {
        const appointmentDate = parseISO(appointment.startTime);
        return isSameDay(appointmentDate, day);
      } catch (e) {
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
      } catch (e) {
        return false;
      }
    });
  };

  // Determine if a day is in the current month
  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentMonth.getMonth();
  };

  return (
    <div className={cn(
      "w-full ios-card p-4",
      isCompact ? "h-auto" : "h-full min-h-[600px]"
    )}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={cn(
          "font-poppins font-semibold",
          isCompact ? "text-xl" : "text-2xl"
        )}>
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={previousMonth}
            className="ios-touch-target flex items-center justify-center rounded-full bg-muted w-10 h-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="ios-touch-target flex items-center justify-center rounded-full bg-muted w-10 h-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
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
                "ios-touch-target flex flex-col items-center justify-start relative",
                isCompact ? "h-11" : "h-20 p-1",
                isSelected && "bg-coral text-white rounded-lg",
                !isSelected && isDayToday && "border border-coral rounded-lg",
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
                        isSelected ? "bg-white/20 text-white" : "bg-coral/10 text-coral"
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
                  <div className="h-1.5 w-1.5 rounded-full bg-coral" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}