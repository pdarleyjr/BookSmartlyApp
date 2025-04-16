import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { useAdminStatus } from "@/hooks/use-admin";
import { appointmentTypesApi } from "@/api/appointment-types";
import { useToast } from "@/hooks/use-toast";
import { IOSButton } from "@/components/ui/ios-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Plus } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Schema } from "@/lib/db-types";
import type { CreateAppointmentTypeDto } from "@/api/appointment-types";

const AppointmentTypesPage = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<Schema["appointment_types"][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateAppointmentTypeDto>({
    name: "",
    durationMinutes: 30,
    price: 0,
    organizationId: null
  });
  const { isAdmin, isOrgAdmin, organizationId } = useAdminStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const types = await appointmentTypesApi.getAppointmentTypes(organizationId);
        setAppointmentTypes(types);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load appointment types. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [organizationId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "durationMinutes" || name === "price") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isEditing && editingId) {
        // Update existing appointment type
        await appointmentTypesApi.updateAppointmentType(editingId, formData);
        toast({
          title: "Success",
          description: "Appointment type updated successfully",
        });
      } else {
        // Create new appointment type
        const newType = await appointmentTypesApi.createAppointmentType({
          ...formData,
          organizationId: organizationId
        });
        setAppointmentTypes(prev => [...prev, newType]);
        toast({
          title: "Success",
          description: "Appointment type created successfully",
        });
      }
      
      // Reset form
      setFormData({
        name: "",
        durationMinutes: 30,
        price: 0,
        organizationId: null
      });
      setIsCreating(false);
      setIsEditing(false);
      setEditingId(null);
      
      // Refresh data
      const types = await appointmentTypesApi.getAppointmentTypes(organizationId);
      setAppointmentTypes(types);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appointment type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (type: Schema["appointment_types"]) => {
    setFormData({
      name: type.name,
      durationMinutes: type.durationMinutes,
      price: type.price,
      organizationId: type.organizationId
    });
    setIsEditing(true);
    setEditingId(type.id!);
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await appointmentTypesApi.deleteAppointmentType(id);
      setAppointmentTypes(prev => prev.filter(type => type.id !== id));
      toast({
        title: "Success",
        description: "Appointment type deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      durationMinutes: 30,
      price: 0,
      organizationId: null
    });
    setIsCreating(false);
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold font-poppins">Appointment Types</h1>
          <div className="flex gap-2">
            <IOSButton 
              onClick={() => navigate("/admin/settings")}
              variant="outline"
            >
              Back to Settings
            </IOSButton>
            {!isCreating && (
              <IOSButton onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </IOSButton>
            )}
          </div>
        </div>
        
        {isCreating ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-poppins">
                {isEditing ? "Edit Appointment Type" : "Create Appointment Type"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-poppins">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Speech Therapy Session"
                    className="ios-touch-target ios-input"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes" className="font-poppins">Duration (minutes)</Label>
                    <Input
                      id="durationMinutes"
                      name="durationMinutes"
                      type="number"
                      min="5"
                      step="5"
                      value={formData.durationMinutes}
                      onChange={handleInputChange}
                      className="ios-touch-target ios-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price" className="font-poppins">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="ios-touch-target ios-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <IOSButton 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </IOSButton>
                  <IOSButton type="submit">
                    {isEditing ? "Update" : "Create"}
                  </IOSButton>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}
        
        {isLoading ? (
          <p className="text-center py-8 font-montserrat">Loading appointment types...</p>
        ) : appointmentTypes.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground font-montserrat mb-4">
              No appointment types found. Create your first appointment type to get started.
            </p>
            <IOSButton onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment Type
            </IOSButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointmentTypes.map((type) => (
              <Card key={type.id} className="overflow-hidden">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-poppins">{type.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{type.durationMinutes} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">${type.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <IOSButton 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(type)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </IOSButton>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <IOSButton size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </IOSButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="ios-card rounded-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-poppins">Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription className="font-montserrat">
                              This will permanently delete this appointment type. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-montserrat">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(type.id!)} 
                              className="bg-destructive font-montserrat"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute to ensure only admins can access
export default () => (
  <AdminProtectedRoute Component={AppointmentTypesPage} />
);