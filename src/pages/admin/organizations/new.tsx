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
import { ArrowLeft } from "lucide-react";

const CreateOrganizationPage = () => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
        toast({
          title: "Success",
          description: "Organization created successfully.",
        });
        navigate("/admin");
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