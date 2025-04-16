import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { IOSButton } from "@/components/ui/ios-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { useAdminStatus } from "@/hooks/use-admin";
import { adminApi } from "@/api/admin";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, Building, AlertCircle } from "lucide-react";
import type { UserWithRole } from "@/api/admin";
import type { Schema } from "@/lib/db-types";

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserWithRole[]>([]);
  const [appointments, setAppointments] = useState<(Schema["appointments"] & { userName?: string })[]>([]);
  const [organizations, setOrganizations] = useState<Schema["organizations"][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSuperAdmin, isOrgAdmin, organizationId } = useAdminStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch users based on admin type
        if (isSuperAdmin) {
          const allUsers = await adminApi.getAllUsers();
          setUsers(allUsers);
          
          const allAppointments = await adminApi.getAllAppointments();
          setAppointments(allAppointments);
          
          const allOrgs = await adminApi.getAllOrganizations();
          setOrganizations(allOrgs);
        } else if (isOrgAdmin && organizationId) {
          const orgUsers = await adminApi.getOrganizationUsers(organizationId);
          
          // Separate regular users from pending users (those without roles)
          const regular = orgUsers.filter(user => user.role);
          const pending = orgUsers.filter(user => !user.role);
          
          setUsers(regular);
          setPendingUsers(pending);
          
          const orgAppointments = await adminApi.getOrganizationAppointments(organizationId);
          setAppointments(orgAppointments);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load admin data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isSuperAdmin, isOrgAdmin, organizationId]);

  const handleApproveUser = async (userId: string) => {
    if (!organizationId) return;
    
    try {
      await adminApi.updateUserRole(userId, 'user');
      
      toast({
        title: "User approved",
        description: "User has been approved and added to your organization.",
      });
      
      // Refresh the user lists
      const orgUsers = await adminApi.getOrganizationUsers(organizationId);
      const regular = orgUsers.filter(user => user.role);
      const pending = orgUsers.filter(user => !user.role);
      
      setUsers(regular);
      setPendingUsers(pending);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!organizationId) return;
    
    try {
      // Remove user from organization
      await adminApi.updateUserOrganization(userId, null);
      
      toast({
        title: "User rejected",
        description: "User has been removed from your organization.",
      });
      
      // Refresh the user lists
      const orgUsers = await adminApi.getOrganizationUsers(organizationId);
      const regular = orgUsers.filter(user => user.role);
      const pending = orgUsers.filter(user => !user.role);
      
      setUsers(regular);
      setPendingUsers(pending);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold font-poppins">Admin Dashboard</h1>
          <IOSButton onClick={() => navigate("/")} variant="outline">
            Back to Calendar
          </IOSButton>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="users" className="font-poppins">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="appointments" className="font-poppins">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="organizations" className="font-poppins">
                <Building className="h-4 w-4 mr-2" />
                Organizations
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="users">
            {/* Pending Users Section (for org admins) */}
            {isOrgAdmin && pendingUsers.length > 0 && (
              <Card className="mb-6 border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="font-poppins flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                    Pending User Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-poppins">Name</th>
                          <th className="text-left py-3 px-4 font-poppins">Email</th>
                          <th className="text-right py-3 px-4 font-poppins">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-montserrat">{user.name || "N/A"}</td>
                            <td className="py-3 px-4 font-montserrat">{user.email}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <IOSButton 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRejectUser(user.id)}
                                  className="text-destructive border-destructive hover:bg-destructive/10"
                                >
                                  Reject
                                </IOSButton>
                                <IOSButton 
                                  size="sm"
                                  onClick={() => handleApproveUser(user.id)}
                                  className="bg-green-600 text-white hover:bg-green-700"
                                >
                                  Approve
                                </IOSButton>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Regular Users Section */}
            <Card>
              <CardHeader>
                <CardTitle className="font-poppins">
                  {isSuperAdmin ? "All Users" : "Organization Users"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-4 font-montserrat">Loading users...</p>
                ) : users.length === 0 ? (
                  <p className="text-center py-4 font-montserrat">No users found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-poppins">Name</th>
                          <th className="text-left py-3 px-4 font-poppins">Email</th>
                          <th className="text-left py-3 px-4 font-poppins">Role</th>
                          {isSuperAdmin && (
                            <th className="text-left py-3 px-4 font-poppins">Organization</th>
                          )}
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
                            {isSuperAdmin && (
                              <td className="py-3 px-4 font-montserrat">
                                {user.organizationName || "None"}
                              </td>
                            )}
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
          </TabsContent>
          
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="font-poppins">
                  {isSuperAdmin ? "All Appointments" : "Organization Appointments"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-4 font-montserrat">Loading appointments...</p>
                ) : appointments.length === 0 ? (
                  <p className="text-center py-4 font-montserrat">No appointments found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-poppins">Title</th>
                          <th className="text-left py-3 px-4 font-poppins">User</th>
                          <th className="text-left py-3 px-4 font-poppins">Start Time</th>
                          <th className="text-left py-3 px-4 font-poppins">End Time</th>
                          <th className="text-right py-3 px-4 font-poppins">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-montserrat">{appointment.title}</td>
                            <td className="py-3 px-4 font-montserrat">{appointment.userName || "Unknown"}</td>
                            <td className="py-3 px-4 font-montserrat">
                              {new Date(appointment.startTime).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-montserrat">
                              {new Date(appointment.endTime).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <IOSButton 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/admin/appointments/${appointment.id}`)}
                              >
                                View
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
          </TabsContent>
          
          {isSuperAdmin && (
            <TabsContent value="organizations">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-poppins">Organizations</CardTitle>
                  <IOSButton 
                    onClick={() => navigate("/admin/organizations/new")}
                    size="sm"
                  >
                    Add Organization
                  </IOSButton>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-center py-4 font-montserrat">Loading organizations...</p>
                  ) : organizations.length === 0 ? (
                    <p className="text-center py-4 font-montserrat">No organizations found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-poppins">Name</th>
                            <th className="text-left py-3 px-4 font-poppins">Created</th>
                            <th className="text-left py-3 px-4 font-poppins">Access Code</th>
                            <th className="text-right py-3 px-4 font-poppins">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {organizations.map((org) => (
                            <tr key={org.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 font-montserrat">{org.name}</td>
                              <td className="py-3 px-4 font-montserrat">
                                {new Date(org.createdAt!).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 font-montserrat">
                                {org.accessCode || "No code"}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <IOSButton 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => navigate(`/admin/organizations/${org.id}`)}
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
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

// Wrap with AdminProtectedRoute to ensure only admins can access
export default () => (
  <AdminProtectedRoute Component={AdminDashboard} />
);