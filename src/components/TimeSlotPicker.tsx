import { useState, useEffect } from "react";
import { format, addMinutes, parseISO, set } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Schema } from "@/lib/db-types";

type TimeSlotPickerProps = {
  date: Date;
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onDurationChange: (minutes: number) => void;
  appointmentType?: Schema["appointment_types"] | null;
};

export function TimeSlotPicker({
  date,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onDurationChange,
  appointmentType
}: TimeSlotPickerProps) {
  const [duration, setDuration] = useState("30");
  
  // Generate time slots in 15-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 96; i++) { // 24 hours * 4 (15-minute intervals)
      const time = addMinutes(start, i * 15);
      slots.push({
        value: format(time, "HH:mm"),
        label: format(time, "h:mm a")
      });
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Update duration when appointment type changes
  useEffect(() => {
    if (appointmentType) {
      setDuration(appointmentType.durationMinutes.toString());
      
      // Update end time based on the appointment type duration
      try {
        const startDateTime = parseISO(startTime);
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(startDateTime.getMinutes() + appointmentType.durationMinutes);
        
        onEndTimeChange(format(endDateTime, "yyyy-MM-dd'T'HH:mm"));
      } catch (e) {
        // Handle parsing errors
      }
    }
  }, [appointmentType, startTime]);
  
  // Update end time when start time or duration changes
  useEffect(() => {
    if (startTime && !appointmentType) {
      try {
        // Create a date object with the selected date and start time
        const startDateTime = parseISO(startTime);
        const durationMinutes = parseInt(duration, 10);
        
        // Add the duration to get the end time
        const endDateTime = addMinutes(startDateTime, durationMinutes);
        onEndTimeChange(format(endDateTime, "yyyy-MM-dd'T'HH:mm"));
      } catch (e) {
        // Handle parsing errors
      }
    }
  }, [startTime, duration, onEndTimeChange, appointmentType]);
  
  const handleStartTimeChange = (timeValue: string) => {
    // Combine the selected date with the time value
    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDateTime = set(date, { hours, minutes });
    onStartTimeChange(format(newDateTime, "yyyy-MM-dd'T'HH:mm"));
  };
  
  const handleDurationChange = (value: string) => {
    setDuration(value);
    onDurationChange(parseInt(value, 10));
  };
  
  return (
    <div className="space-y-4 font-montserrat">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time" className="font-poppins">Start Time</Label>
          <Select 
            onValueChange={handleStartTimeChange}
            value={startTime ? format(parseISO(startTime), "HH:mm") : undefined}
          >
            <SelectTrigger id="start-time" className="ios-touch-target">
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {timeSlots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value} className="ios-touch-target">
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration" className="font-poppins">Duration</Label>
          <Select 
            onValueChange={handleDurationChange}
            value={duration}
            disabled={!!appointmentType}
          >
            <SelectTrigger id="duration" className="ios-touch-target">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15" className="ios-touch-target">15 minutes</SelectItem>
              <SelectItem value="30" className="ios-touch-target">30 minutes</SelectItem>
              <SelectItem value="45" className="ios-touch-target">45 minutes</SelectItem>
              <SelectItem value="60" className="ios-touch-target">1 hour</SelectItem>
              <SelectItem value="90" className="ios-touch-target">1.5 hours</SelectItem>
              <SelectItem value="120" className="ios-touch-target">2 hours</SelectItem>
            </SelectContent>
          </Select>
          {appointmentType && (
            <p className="text-xs text-muted-foreground">
              Duration set by appointment type
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="end-time" className="font-poppins">End Time</Label>
        <Input 
          id="end-time"
          value={endTime ? format(parseISO(endTime), "h:mm a") : ""}
          readOnly
          disabled
          className="ios-touch-target"
        />
      </div>
    </div>
  );
}