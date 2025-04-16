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
import { ArrowLeft } from "lucide-react";
import type { UserWithRole } from "@/api/admin";
import type { Schema } from "@/lib/db-types";

const OrganizationManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<Schema["organizations"] | null>(null);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all organizations to find the specific one
        const allOrgs = await adminApi.getAllOrganizations();
        const foundOrg = allOrgs.find(o => o.id === parseInt(id));
        
        if (foundOrg) {
          setOrganization(foundOrg);
          
          // Fetch all users to find those in this organization
          const allUsers = await adminApi.getAllUsers();
          const orgUsers = allUsers.filter(u => u.organizationId === foundOrg.id);
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
};

// Wrap with AdminProtectedRoute to ensure only super admins can access
export default () => (
  <AdminProtectedRoute Component={OrganizationManagementPage} requireSuperAdmin={true} />
);