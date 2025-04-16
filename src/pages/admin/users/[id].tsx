import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { IOSButton } from "@/components/ui/ios-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { useAdminStatus } from "@/hooks/use-admin";
import { adminApi } from "@/api/admin";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import type { UserWithRole } from "@/api/admin";
import type { Schema } from "@/lib/db-types";

type UserRole = Schema["user_roles"]["role"] | "";

const UserManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [organizations, setOrganizations] = useState<Schema["organizations"][]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>("");
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isSuperAdmin, isOrgAdmin, organizationId } = useAdminStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all users to find the specific one
        let users: UserWithRole[] = [];
        if (isSuperAdmin) {
          users = await adminApi.getAllUsers();
          const allOrgs = await adminApi.getAllOrganizations();
          setOrganizations(allOrgs);
        } else if (isOrgAdmin && organizationId) {
          users = await adminApi.getOrganizationUsers(organizationId);
        }
        
        const foundUser = users.find(u => u.id === id);
        if (foundUser) {
          setUser(foundUser);
          setSelectedRole(foundUser.role || "");
          setSelectedOrgId(foundUser.organizationId?.toString() || "");
        } else {
          toast({
            title: "Error",
            description: "User not found or you don't have permission to manage this user.",
            variant: "destructive",
          });
          navigate("/admin");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
        navigate("/admin");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, isSuperAdmin, isOrgAdmin, organizationId]);

  const handleRoleChange = (value: string) => {
    // Validate that the value is a valid role
    if (value === 'user' || value === 'org_admin' || value === 'super_admin' || value === '') {
      setSelectedRole(value as UserRole);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Update role if changed and not super admin (can't change super admin role)
      if (selectedRole && selectedRole !== user.role && selectedRole !== 'super_admin') {
        await adminApi.updateUserRole(user.id, selectedRole as Schema["user_roles"]["role"]);
      }
      
      // Update organization if changed and super admin
      if (isSuperAdmin && selectedOrgId !== (user.organizationId?.toString() || "")) {
        const newOrgId = selectedOrgId ? parseInt(selectedOrgId) : null;
        await adminApi.updateUserOrganization(user.id, newOrgId);
      }
      
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      
      navigate("/admin");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
          <p className="text-center py-8 font-montserrat">Loading user data...</p>
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
        
        {user && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-poppins">Manage User: {user.name || user.email}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-poppins">Email</Label>
                  <div className="p-3 bg-muted rounded-md font-montserrat">{user.email}</div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-poppins">Name</Label>
                  <div className="p-3 bg-muted rounded-md font-montserrat">{user.name || "Not set"}</div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="font-poppins">Role</Label>
                  <Select 
                    value={selectedRole} 
                    onValueChange={handleRoleChange}
                    disabled={user.role === 'super_admin' || isSaving}
                  >
                    <SelectTrigger id="role" className="ios-touch-target">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Super admin can assign any role except super admin */}
                      {isSuperAdmin && (
                        <>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="org_admin">Organization Admin</SelectItem>
                        </>
                      )}
                      
                      {/* Org admin can only assign user role */}
                      {isOrgAdmin && !isSuperAdmin && (
                        <SelectItem value="user">User</SelectItem>
                      )}
                      
                      {/* Show super admin as disabled option if user is already super admin */}
                      {user.role === 'super_admin' && (
                        <SelectItem value="super_admin" disabled>Super Admin</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {user.role === 'super_admin' && (
                    <p className="text-sm text-muted-foreground font-montserrat">
                      Super Admin role cannot be changed.
                    </p>
                  )}
                </div>
                
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="organization" className="font-poppins">Organization</Label>
                    <Select 
                      value={selectedOrgId} 
                      onValueChange={setSelectedOrgId}
                      disabled={isSaving}
                    >
                      <SelectTrigger id="organization" className="ios-touch-target">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {organizations.map(org => (
                          <SelectItem key={org.id} value={org.id!.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <IOSButton 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="ios-touch-target bg-coral text-white font-montserrat"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </IOSButton>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

// Wrap with AdminProtectedRoute to ensure only admins can access
export default () => (
  <AdminProtectedRoute Component={UserManagementPage} />
);