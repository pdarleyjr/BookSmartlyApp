import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { useAdminStatus } from "@/hooks/use-admin";
import { locationsApi } from "@/api/locations";
import { useToast } from "@/hooks/use-toast";
import { IOSButton } from "@/components/ui/ios-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus, MapPin } from "lucide-react";
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
import type { CreateLocationDto } from "@/api/locations";

const LocationsPage = () => {
  const [locations, setLocations] = useState<Schema["locations"][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateLocationDto>({
    name: "",
    address: "",
    organizationId: null
  });
  const { isAdmin, isOrgAdmin, organizationId } = useAdminStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const locs = await locationsApi.getLocations(organizationId);
        setLocations(locs);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load locations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [organizationId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        // Update existing location
        await locationsApi.updateLocation(editingId, formData);
        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      } else {
        // Create new location
        const newLocation = await locationsApi.createLocation({
          ...formData,
          organizationId: organizationId
        });
        setLocations(prev => [...prev, newLocation]);
        toast({
          title: "Success",
          description: "Location created successfully",
        });
      }
      
      // Reset form
      setFormData({
        name: "",
        address: "",
        organizationId: null
      });
      setIsCreating(false);
      setIsEditing(false);
      setEditingId(null);
      
      // Refresh data
      const locs = await locationsApi.getLocations(organizationId);
      setLocations(locs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save location. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (location: Schema["locations"]) => {
    setFormData({
      name: location.name,
      address: location.address || "",
      organizationId: location.organizationId
    });
    setIsEditing(true);
    setEditingId(location.id!);
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await locationsApi.deleteLocation(id);
      setLocations(prev => prev.filter(loc => loc.id !== id));
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      address: "",
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
          <h1 className="text-3xl font-bold font-poppins">Locations</h1>
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
                Add Location
              </IOSButton>
            )}
          </div>
        </div>
        
        {isCreating ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-poppins">
                {isEditing ? "Edit Location" : "Create Location"}
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
                    placeholder="e.g., Main Office"
                    className="ios-touch-target ios-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-poppins">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    placeholder="Full address"
                    className="ios-input min-h-[100px] resize-none"
                  />
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
          <p className="text-center py-8 font-montserrat">Loading locations...</p>
        ) : locations.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground font-montserrat mb-4">
              No locations found. Create your first location to get started.
            </p>
            <IOSButton onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </IOSButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <Card key={location.id} className="overflow-hidden">
                <div className="h-2 bg-secondary w-full" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-poppins">{location.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    {location.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <IOSButton 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(location)}
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
                              This will permanently delete this location. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-montserrat">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(location.id!)} 
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
  <AdminProtectedRoute Component={LocationsPage} />
);