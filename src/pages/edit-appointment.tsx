import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { IOSButton } from "@/components/ui/ios-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fine } from "@/lib/fine";
import { ProtectedRoute } from "@/components/auth/route-components";
import type { Schema } from "@/lib/db-types";

const EditAppointmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Schema["appointments"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id || !session?.user?.id) return;

      try {
        setIsLoading(true);
        const data = await fine.table("appointments")
          .select()
          .eq("id", parseInt(id))
          .eq("userId", session.user.id);

        if (data && data.length > 0) {
          setAppointment(data[0]);
          setFormData({
            title: data[0].title,
            description: data[0].description || "",
            location: data[0].location || "",
            startTime: data[0].startTime,
            endTime: data[0].endTime,
          });
        } else {
          toast({
            title: "Error",
            description: "Appointment not found or you don't have permission to edit it.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load appointment details. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id, session?.user?.id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id || !appointment?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to edit appointments",
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
      setIsSaving(true);
      
      await fine.table("appointments")
        .update(formData)
        .eq("id", appointment.id)
        .eq("userId", session.user.id);
      
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-center py-8">Loading appointment details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Appointment</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Meeting with client"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Discuss project details"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Office or virtual meeting link"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <IOSButton 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/")}
                  disabled={isSaving}
                >
                  Cancel
                </IOSButton>
                <IOSButton 
                  type="submit" 
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </IOSButton>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedEditAppointment = () => (
  <ProtectedRoute Component={EditAppointmentPage} />
);

export default ProtectedEditAppointment;