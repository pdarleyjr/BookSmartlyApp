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

export function CalendarView({
  appointments,
  onDateSelect,
  selectedDate,
  isCompact = false
}: CalendarViewProps) {
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

  // Navigation functions
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
      } catch {
        return false;
      }
    });
  };

  // Determine if a day is in the current month
  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentMonth.getMonth();
  };

  // Dynamic sizing based on isCompact
  const dayButtonHeight = isCompact ? "h-20" : "h-12";
  const dayNumberSize = isCompact ? "text-lg w-10 h-10" : "text-sm w-7 h-7";
  const monthTitleSize = isCompact ? "text-2xl" : "text-xl";
  const padding = isCompact ? "p-6" : "p-4";

  return (
    <div className={cn("w-full border rounded-lg bg-card", padding)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={cn(monthTitleSize, "font-semibold")}>
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-muted"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground py-1">
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
          
          return (
            <button
              key={day.toString()}
              className={cn(
                "flex flex-col items-center justify-start relative",
                dayButtonHeight,
                "p-1",
                isSelected && "bg-primary text-white rounded-lg",
                !isSelected && isDayToday && "border border-primary rounded-lg",
                !isSelected && !isDayToday && "hover:bg-muted rounded-lg",
                isOtherMonth && "opacity-40"
              )}
              onClick={() => onDateSelect(day)}
            >
              <time dateTime={format(day, "yyyy-MM-dd")} className={cn(
                dayNumberSize,
                "flex items-center justify-center rounded-full",
                isSelected && "font-bold"
              )}>
                {format(day, "d")}
              </time>
              
              {hasAppointment && !isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}