import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { IOSButton } from "@/components/ui/ios-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fine } from "@/lib/fine";
import { useAppDispatch } from "@/redux/hooks";
import { addAppointment, updateAppointment } from "@/redux/slices/appointmentsSlice";
import { useAdminStatus } from "@/hooks/use-admin";
import { appointmentTypesApi } from "@/api/appointment-types";
import { locationsApi } from "@/api/locations";
import { adminApi } from "@/api/admin";
import type { Schema } from "@/lib/db-types";
import type { UpdateAppointmentDto } from "@/api/appointments";

type AppointmentFormProps = {
  appointment?: Schema["appointments"];
  isEditing?: boolean;
};

export function AppointmentForm({ appointment, isEditing = false }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentTypes, setAppointmentTypes] = useState<Schema["appointment_types"][]>([]);
  const [locations, setLocations] = useState<Schema["locations"][]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<Schema["users"][]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const dispatch = useAppDispatch();
  const { isAdmin, isOrgAdmin, organizationId } = useAdminStatus();
  
  const [formData, setFormData] = useState<Omit<Schema["appointments"], "id" | "userId" | "createdAt" | "updatedAt">>({
    title: "",
    description: "",
    location: "",
    startTime: format(selectedDate, "yyyy-MM-dd'T'10:00"),
    endTime: format(selectedDate, "yyyy-MM-dd'T'10:30"),
    clientName: "",
    appointmentTypeId: undefined,
    locationId: undefined,
    assignedToUserId: undefined,
    price: undefined
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load appointment types
        const types = await appointmentTypesApi.getAppointmentTypes(organizationId);
        setAppointmentTypes(types);
        
        // Load locations
        const locs = await locationsApi.getLocations(organizationId);
        setLocations(locs);
        
        // Load organization users if admin
        if ((isOrgAdmin || isAdmin) && organizationId) {
          const users = await adminApi.getOrganizationUsers(organizationId);
          setOrganizationUsers(users);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [organizationId, isOrgAdmin, isAdmin]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title,
        description: appointment.description || "",
        location: appointment.location || "",
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        clientName: appointment.clientName || "",
        appointmentTypeId: appointment.appointmentTypeId,
        locationId: appointment.locationId,
        assignedToUserId: appointment.assignedToUserId || session?.user?.id || "",
        price: appointment.price
      });
      
      try {
        // If editing, set the selected date from the appointment's start time
        if (appointment.startTime) {
          setSelectedDate(new Date(appointment.startTime));
        }
      } catch (e) {
        // Handle date parsing errors
      }
    } else {
      // For new appointments, set the current user as the default assignee
      setFormData(prev => ({
        ...prev,
        assignedToUserId: session?.user?.id || ""
      }));
    }
  }, [appointment, session?.user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "appointmentTypeId") {
      const selectedType = appointmentTypes.find(type => type.id === parseInt(value));
      
      if (selectedType) {
        // Update duration based on the selected appointment type
        const startDateTime = new Date(formData.startTime);
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(startDateTime.getMinutes() + selectedType.durationMinutes);
        
        setFormData(prev => ({ 
          ...prev, 
          [name]: parseInt(value),
          endTime: format(endDateTime, "yyyy-MM-dd'T'HH:mm"),
          price: selectedType.price
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
      }
    } else if (name === "locationId") {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStartTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, startTime: time }));
    
    // Update end time based on appointment type duration
    if (formData.appointmentTypeId) {
      const selectedType = appointmentTypes.find(type => type.id === formData.appointmentTypeId);
      
      if (selectedType) {
        const startDateTime = new Date(time);
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(startDateTime.getMinutes() + selectedType.durationMinutes);
        
        setFormData(prev => ({ 
          ...prev, 
          startTime: time,
          endTime: format(endDateTime, "yyyy-MM-dd'T'HH:mm")
        }));
      }
    }
  };

  const handleEndTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, endTime: time }));
    
    // Update price based on duration if appointment type is selected
    if (formData.appointmentTypeId) {
      const selectedType = appointmentTypes.find(type => type.id === formData.appointmentTypeId);
      
      if (selectedType) {
        const startTime = new Date(formData.startTime);
        const endTime = new Date(time);
        const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        
        // Calculate price proportionally to the base duration
        const priceMultiplier = durationMinutes / selectedType.durationMinutes;
        const calculatedPrice = selectedType.price * priceMultiplier;
        
        setFormData(prev => ({ 
          ...prev, 
          price: calculatedPrice
        }));
      }
    }
  };

  const handleDurationChange = (minutes: number) => {
    // Update end time based on duration
    const startDateTime = new Date(formData.startTime);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(startDateTime.getMinutes() + minutes);
    
    setFormData(prev => ({ 
      ...prev, 
      endTime: format(endDateTime, "yyyy-MM-dd'T'HH:mm")
    }));
    
    // Update price based on duration if appointment type is selected
    if (formData.appointmentTypeId) {
      const selectedType = appointmentTypes.find(type => type.id === formData.appointmentTypeId);
      
      if (selectedType) {
        // Calculate price proportionally to the base duration
        const priceMultiplier = minutes / selectedType.durationMinutes;
        const calculatedPrice = selectedType.price * priceMultiplier;
        
        setFormData(prev => ({ 
          ...prev, 
          price: calculatedPrice
        }));
      }
    }
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
    
    if (!formData.title && !formData.clientName) {
      toast({
        title: "Error",
        description: "Title or client name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // If no title is provided but client name is, use client name as title
      const finalFormData = {
        ...formData,
        title: formData.title || `Appointment for ${formData.clientName}`
      };
      
      if (isEditing && appointment?.id) {
        // Update existing appointment
        const updateData: UpdateAppointmentDto = {
          title: finalFormData.title,
          description: finalFormData.description,
          location: finalFormData.location,
          startTime: finalFormData.startTime,
          endTime: finalFormData.endTime,
          clientName: finalFormData.clientName,
          appointmentTypeId: finalFormData.appointmentTypeId,
          locationId: finalFormData.locationId,
          assignedToUserId: finalFormData.assignedToUserId,
          price: finalFormData.price
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
          ...finalFormData,
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

  // Find the selected appointment type
  const selectedAppointmentType = formData.appointmentTypeId 
    ? appointmentTypes.find(type => type.id === formData.appointmentTypeId)
    : null;

  // Find the selected location
  const selectedLocation = formData.locationId
    ? locations.find(loc => loc.id === formData.locationId)
    : null;

  return (
    <Card className="ios-card w-full border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-poppins">{isEditing ? "Edit Appointment" : "Create New Appointment"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName" className="font-poppins">Client Name</Label>
            <Input
              id="clientName"
              name="clientName"
              value={formData.clientName || ""}
              onChange={handleInputChange}
              placeholder="Enter client name"
              className="ios-touch-target ios-input"
            />
          </div>
          
          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="appointmentType" className="font-poppins">Appointment Type</Label>
            <Select 
              value={formData.appointmentTypeId?.toString() || ""} 
              onValueChange={(value) => handleSelectChange("appointmentTypeId", value)}
            >
              <SelectTrigger id="appointmentType" className="ios-touch-target">
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id!.toString()}>
                    {type.name} - ${type.price} ({type.durationMinutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAppointmentType && formData.price && (
              <p className="text-sm text-muted-foreground">
                Price: ${formData.price.toFixed(2)}
              </p>
            )}
          </div>
          
          {/* Assigned Clinician - Always show this field */}
          <div className="space-y-2">
            <Label htmlFor="assignedToUserId" className="font-poppins">Assigned Clinician</Label>
            <Select 
              value={formData.assignedToUserId || ""} 
              onValueChange={(value) => handleSelectChange("assignedToUserId", value)}
            >
              <SelectTrigger id="assignedToUserId" className="ios-touch-target">
                <SelectValue placeholder="Select clinician" />
              </SelectTrigger>
              <SelectContent>
                {organizationUsers.length > 0 ? (
                  organizationUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))
                ) : (
                  // If no organization users, show current user
                  <SelectItem value={session?.user?.id || ""}>
                    {session?.user?.name || session?.user?.email || "You"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {organizationUsers.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No other clinicians available. Add users to your organization in admin settings.
              </p>
            )}
          </div>
          
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="font-poppins">Location</Label>
            <Select 
              value={formData.locationId?.toString() || ""} 
              onValueChange={(value) => handleSelectChange("locationId", value)}
            >
              <SelectTrigger id="location" className="ios-touch-target">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id!.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLocation?.address && (
              <p className="text-sm text-muted-foreground">
                {selectedLocation.address}
              </p>
            )}
          </div>
          
          {/* Optional Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-poppins">Title (Optional)</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Meeting with client"
              className="ios-touch-target ios-input"
            />
            <p className="text-xs text-muted-foreground">
              If left blank, client name will be used as title
            </p>
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
          
          <TimeSlotPicker
            date={selectedDate}
            startTime={formData.startTime}
            endTime={formData.endTime}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onDurationChange={handleDurationChange}
            appointmentType={selectedAppointmentType}
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