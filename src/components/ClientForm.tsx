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
    cellPhone: client?.cellPhone || "",
    workPhone: client?.workPhone || "",
    fax: client?.fax || "",
    address: client?.address || "",
    city: client?.city || "",
    state: client?.state || "",
    zipCode: client?.zipCode || "",
    country: client?.country || "",
    dateOfBirth: client?.dateOfBirth || "",
    gender: client?.gender || "",
    occupation: client?.occupation || "",
    company: client?.company || "",
    referredBy: client?.referredBy || "",
    emergencyContact: client?.emergencyContact || "",
    emergencyPhone: client?.emergencyPhone || "",
    insuranceProvider: client?.insuranceProvider || "",
    insuranceId: client?.insuranceId || "",
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="phone" className="font-poppins">Primary Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="ios-touch-target ios-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cellPhone" className="font-poppins">Cell Phone</Label>
              <Input
                id="cellPhone"
                name="cellPhone"
                value={formData.cellPhone || ""}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="ios-touch-target ios-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workPhone" className="font-poppins">Work Phone</Label>
              <Input
                id="workPhone"
                name="workPhone"
                value={formData.workPhone || ""}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="ios-touch-target ios-input"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fax" className="font-poppins">Fax</Label>
            <Input
              id="fax"
              name="fax"
              value={formData.fax || ""}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
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
              placeholder="Enter street address"
              rows={2}
              className="ios-input min-h-[80px] resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="font-poppins">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city || ""}
                onChange={handleInputChange}
                placeholder="City"
                className="ios-touch-target ios-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state" className="font-poppins">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state || ""}
                onChange={handleInputChange}
                placeholder="State"
                className="ios-touch-target ios-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="font-poppins">Zip Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode || ""}
                onChange={handleInputChange}
                placeholder="Zip Code"
                className="ios-touch-target ios-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country" className="font-poppins">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country || ""}
                onChange={handleInputChange}
                placeholder="Country"
                className="ios-touch-target ios-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="gender" className="font-poppins">Gender</Label>
              <Input
                id="gender"
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
                placeholder="Gender"
                className="ios-touch-target ios-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="occupation" className="font-poppins">Occupation</Label>
              <Input
                id="occupation"
                name="occupation"
                value={formData.occupation || ""}
                onChange={handleInputChange}
                placeholder="Occupation"
                className="ios-touch-target ios-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="font-poppins">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company || ""}
                onChange={handleInputChange}
                placeholder="Company"
                className="ios-touch-target ios-input"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="referredBy" className="font-poppins">Referred By</Label>
            <Input
              id="referredBy"
              name="referredBy"
              value={formData.referredBy || ""}
              onChange={handleInputChange}
              placeholder="How did they hear about you?"
              className="ios-touch-target ios-input"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="font-poppins">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact || ""}
                onChange={handleInputChange}
                placeholder="Emergency Contact Name"
                className="ios-touch-target ios-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone" className="font-poppins">Emergency Phone</Label>
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone || ""}
                onChange={handleInputChange}
                placeholder="Emergency Contact Phone"
                className="ios-touch-target ios-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insuranceProvider" className="font-poppins">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                name="insuranceProvider"
                value={formData.insuranceProvider || ""}
                onChange={handleInputChange}
                placeholder="Insurance Provider"
                className="ios-touch-target ios-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insuranceId" className="font-poppins">Insurance ID</Label>
              <Input
                id="insuranceId"
                name="insuranceId"
                value={formData.insuranceId || ""}
                onChange={handleInputChange}
                placeholder="Insurance ID/Policy Number"
                className="ios-touch-target ios-input"
              />
            </div>
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