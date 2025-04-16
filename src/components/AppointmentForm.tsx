import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { IOSButton } from "@/components/ui/ios-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { useToast } from "@/hooks/use-toast";
import { fine } from "@/lib/fine";
import { useAppDispatch } from "@/redux/hooks";
import { addAppointment, updateAppointment } from "@/redux/slices/appointmentsSlice";
import type { Schema } from "@/lib/db-types";
import type { UpdateAppointmentDto } from "@/api/appointments";

type AppointmentFormProps = {
  appointment?: Schema["appointments"];
  isEditing?: boolean;
};

export function AppointmentForm({ appointment, isEditing = false }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const dispatch = useAppDispatch();
  
  const [formData, setFormData] = useState<Omit<Schema["appointments"], "id" | "userId" | "createdAt" | "updatedAt">>({
    title: "",
    description: "",
    location: "",
    startTime: format(selectedDate, "yyyy-MM-dd'T'10:00"),
    endTime: format(selectedDate, "yyyy-MM-dd'T'10:30")
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title,
        description: appointment.description || "",
        location: appointment.location || "",
        startTime: appointment.startTime,
        endTime: appointment.endTime
      });
      
      try {
        // If editing, set the selected date from the appointment's start time
        if (appointment.startTime) {
          setSelectedDate(new Date(appointment.startTime));
        }
      } catch (e) {
        // Handle date parsing errors
      }
    }
  }, [appointment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, startTime: time }));
  };

  const handleEndTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, endTime: time }));
  };

  const handleDurationChange = (minutes: number) => {
    // This is handled in the TimeSlotPicker component
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create appointments",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (!formData.title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isEditing && appointment?.id) {
        // Update existing appointment
        const updateData: UpdateAppointmentDto = {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          startTime: formData.startTime,
          endTime: formData.endTime,
        };
        
        await dispatch(updateAppointment({
          id: appointment.id,
          appointment: updateData,
          userId: session.user.id
        })).unwrap();
        
        toast({
          title: "Success",
          description: "Appointment updated successfully",
        });
      } else {
        // Create new appointment
        await dispatch(addAppointment({
          ...formData,
          userId: session.user.id,
        })).unwrap();
        
        toast({
          title: "Success",
          description: "Appointment created successfully",
        });
      }
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="ios-card w-full border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-poppins">{isEditing ? "Edit Appointment" : "Create New Appointment"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-poppins">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Meeting with client"
              required
              className="ios-touch-target ios-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-poppins">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Discuss project details"
              rows={3}
              className="ios-input min-h-[100px] resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location" className="font-poppins">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={handleInputChange}
              placeholder="Office or virtual meeting link"
              className="ios-touch-target ios-input"
            />
          </div>
          
          <TimeSlotPicker
            date={selectedDate}
            startTime={formData.startTime}
            endTime={formData.endTime}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onDurationChange={handleDurationChange}
          />
        </CardContent>
        
        <CardFooter className="flex justify-between pb-6">
          <IOSButton 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/")}
            disabled={isLoading}
            className="ios-touch-target font-montserrat"
          >
            Cancel
          </IOSButton>
          <IOSButton 
            type="submit" 
            disabled={isLoading}
            className="ios-touch-target bg-coral text-white font-montserrat"
          >
            {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
          </IOSButton>
        </CardFooter>
      </form>
    </Card>
  );
}