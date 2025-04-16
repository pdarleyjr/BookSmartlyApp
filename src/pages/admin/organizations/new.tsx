import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { IOSButton } from "@/components/ui/ios-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { adminApi } from "@/api/admin";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy } from "lucide-react";
import type { Schema } from "@/lib/db-types";

const CreateOrganizationPage = () => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdOrg, setCreatedOrg] = useState<(Schema["organizations"] & { accessCode: string }) | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Organization name is required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const newOrg = await adminApi.createOrganization(name);
      
      if (newOrg) {
        setCreatedOrg(newOrg as any);
        toast({
          title: "Success",
          description: "Organization created successfully.",
        });
      } else {
        throw new Error("Failed to create organization");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (createdOrg?.accessCode) {
      navigator.clipboard.writeText(createdOrg.accessCode);
      toast({
        title: "Copied",
        description: "Access code copied to clipboard.",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <IOSButton 
            variant="ghost" 
            onClick={() => navigate("/admin")}
            className="ios-touch-target flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Admin Dashboard
          </IOSButton>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-poppins">Create New Organization</CardTitle>
          </CardHeader>
          <CardContent>
            {!createdOrg ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-poppins">Organization Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter organization name"
                    className="ios-touch-target ios-input"
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="flex justify-end pt-4">
                  <IOSButton 
                    type="submit" 
                    disabled={isLoading}
                    className="ios-touch-target bg-coral text-white font-montserrat"
                  >
                    {isLoading ? "Creating..." : "Create Organization"}
                  </IOSButton>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 mb-2 font-poppins">
                    Organization Created Successfully
                  </h3>
                  <p className="text-green-700 font-montserrat">
                    Your new organization has been created. Share the access code with users who need to join.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-poppins">Organization Name</Label>
                  <div className="p-3 bg-muted rounded-md font-montserrat">
                    {createdOrg.name}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accessCode" className="font-poppins">Access Code</Label>
                  <div className="flex gap-2">
                    <div className="p-3 bg-muted rounded-md font-montserrat flex-1">
                      {createdOrg.accessCode}
                    </div>
                    <IOSButton 
                      type="button" 
                      variant="outline" 
                      onClick={handleCopyCode}
                      className="ios-touch-target"
                    >
                      <Copy className="h-4 w-4" />
                    </IOSButton>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This code is required for users to join this organization.
                  </p>
                </div>
                
                <div className="flex justify-between pt-4">
                  <IOSButton 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(`/admin/organizations/${createdOrg.id}`)}
                    className="ios-touch-target"
                  >
                    View Organization
                  </IOSButton>
                  
                  <IOSButton 
                    type="button" 
                    onClick={() => navigate("/admin")}
                    className="ios-touch-target bg-coral text-white font-montserrat"
                  >
                    Return to Dashboard
                  </IOSButton>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Wrap with AdminProtectedRoute to ensure only super admins can access
export default () => (
  <AdminProtectedRoute Component={CreateOrganizationPage} requireSuperAdmin={true} />
);