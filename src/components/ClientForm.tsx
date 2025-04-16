import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IOSButton } from "@/components/ui/ios-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { clientsApi } from "@/api/clients";
import { useAdminStatus } from "@/hooks/use-admin";
import type { Schema } from "@/lib/db-types";
import type { CreateClientDto } from "@/api/clients";

type ClientFormProps = {
  client?: Schema["clients"];
  isEditing?: boolean;
};

export function ClientForm({ client, isEditing = false }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organizationId } = useAdminStatus();
  
  const [formData, setFormData] = useState<CreateClientDto>({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    dateOfBirth: client?.dateOfBirth || "",
    notes: client?.notes || "",
    organizationId: client?.organizationId || organizationId
  });

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
      setIsLoading(true);
      
      if (isEditing && client?.id) {
        // Update existing client
        await clientsApi.updateClient(client.id, formData);
        
        toast({
          title: "Success",
          description: "Client updated successfully",
        });
      } else {
        // Create new client
        await clientsApi.createClient({
          ...formData,
          organizationId
        });
        
        toast({
          title: "Success",
          description: "Client created successfully",
        });
      }
      
      navigate("/clients");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="ios-card w-full border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-poppins">{isEditing ? "Edit Client" : "Create New Client"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-poppins">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter client name"
              className="ios-touch-target ios-input"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="font-poppins">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              placeholder="client@example.com"
              className="ios-touch-target ios-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-poppins">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
              className="ios-touch-target ios-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="font-poppins">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ""}
              onChange={handleInputChange}
              className="ios-touch-target ios-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="font-poppins">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              placeholder="Enter address"
              rows={3}
              className="ios-input min-h-[100px] resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-poppins">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              placeholder="Additional notes"
              rows={3}
              className="ios-input min-h-[100px] resize-none"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pb-6">
          <IOSButton 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/clients")}
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