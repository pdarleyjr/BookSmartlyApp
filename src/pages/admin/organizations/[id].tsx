import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { IOSButton } from "@/components/ui/ios-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { adminApi } from "@/api/admin";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, RefreshCw } from "lucide-react";
import type { UserWithRole } from "@/api/admin";
import type { Schema } from "@/lib/db-types";

const OrganizationManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<Schema["organizations"] | null>(null);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch organization details
        const orgId = parseInt(id);
        const orgDetails = await adminApi.getOrganizationDetails(orgId);
        
        if (orgDetails) {
          setOrganization(orgDetails);
          
          // Fetch users in this organization
          const orgUsers = await adminApi.getOrganizationUsers(orgId);
          setUsers(orgUsers);
        } else {
          toast({
            title: "Error",
            description: "Organization not found.",
            variant: "destructive",
          });
          navigate("/admin");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load organization data. Please try again.",
          variant: "destructive",
        });
        navigate("/admin");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleCopyCode = () => {
    if (organization?.accessCode) {
      navigator.clipboard.writeText(organization.accessCode);
      toast({
        title: "Copied",
        description: "Access code copied to clipboard.",
      });
    }
  };

  const handleRegenerateCode = async () => {
    if (!organization?.id) return;
    
    try {
      setIsRegenerating(true);
      const newCode = await adminApi.regenerateOrganizationCode(organization.id);
      
      if (newCode) {
        setOrganization(prev => prev ? { ...prev, accessCode: newCode } : null);
        toast({
          title: "Success",
          description: "Access code regenerated successfully.",
        });
      } else {
        throw new Error("Failed to regenerate access code");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate access code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
          <p className="text-center py-8 font-montserrat">Loading organization data...</p>
        </main>
      </div>
    );
  }

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
        
        {organization && (
          <>
            <Card className="max-w-2xl mx-auto mb-8">
              <CardHeader>
                <CardTitle className="font-poppins">Organization: {organization.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-poppins">Name</Label>
                    <div className="p-3 bg-muted rounded-md font-montserrat">{organization.name}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accessCode" className="font-poppins">Access Code</Label>
                    <div className="flex gap-2">
                      <div className="p-3 bg-muted rounded-md font-montserrat flex-1">
                        {organization.accessCode || "No access code"}
                      </div>
                      <IOSButton 
                        type="button" 
                        variant="outline" 
                        onClick={handleCopyCode}
                        disabled={!organization.accessCode}
                        className="ios-touch-target"
                      >
                        <Copy className="h-4 w-4" />
                      </IOSButton>
                      <IOSButton 
                        type="button" 
                        variant="outline" 
                        onClick={handleRegenerateCode}
                        disabled={isRegenerating}
                        className="ios-touch-target"
                      >
                        <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                      </IOSButton>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This code is required for users to join this organization.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="created" className="font-poppins">Created</Label>
                    <div className="p-3 bg-muted rounded-md font-montserrat">
                      {organization.createdAt ? new Date(organization.createdAt).toLocaleString() : "Unknown"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="font-poppins">Organization Users</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-center py-4 font-montserrat">No users in this organization.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-poppins">Name</th>
                          <th className="text-left py-3 px-4 font-poppins">Email</th>
                          <th className="text-left py-3 px-4 font-poppins">Role</th>
                          <th className="text-right py-3 px-4 font-poppins">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-montserrat">{user.name || "N/A"}</td>
                            <td className="py-3 px-4 font-montserrat">{user.email}</td>
                            <td className="py-3 px-4 font-montserrat">
                              {user.role === 'super_admin' ? 'Super Admin' : 
                               user.role === 'org_admin' ? 'Org Admin' : 
                               user.role === 'user' ? 'User' : 'No Role'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <IOSButton 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                              >
                                Manage
                              </IOSButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

// Wrap with AdminProtectedRoute to ensure only super admins can access
export default () => (
  <AdminProtectedRoute Component={OrganizationManagementPage} requireSuperAdmin={true} />
);