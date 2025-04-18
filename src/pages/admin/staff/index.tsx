import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/auth/route-components";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { useAdminStatus } from "@/hooks/use-admin";
import { useNavigate } from "react-router-dom";
import { User, UserPlus, Edit, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Schema } from "@/lib/db-types";

type StaffMember = {
  id: string | number;
  email: string;
  name?: string;
  organizationId?: number;
  organizationApproved?: boolean;
  createdAt?: string;
  updatedAt?: string;
  roles?: Schema["user_roles"][];
  userId?: string;
  licenseNumber?: string | null;
  specialty?: string | null;
  bio?: string | null;
  hireDate?: string | null;
  status?: "active" | "inactive" | null;
};

const StaffManagement = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "org_admin" | "super_admin">("user");
  const [staffDetails, setStaffDetails] = useState({
    licenseNumber: "",
    specialty: "",
    bio: "",
    hireDate: "",
    status: "active" as "active" | "inactive"
  });
  
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin, isOrgAdmin } = useAdminStatus();
  const navigate = useNavigate();
  const { data: session } = fine.auth.useSession();
  
  useEffect(() => {
    const loadStaffMembers = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Get the organization ID of the current user
        const currentUser = await fine.table("users")
          .select()
          .eq("id", session.user.id);
        
        if (!currentUser || currentUser.length === 0 || !currentUser[0].organizationId) {
          toast({
            title: "Error",
            description: "Could not determine your organization",
            variant: "destructive",
          });
          return;
        }
        
        const organizationId = currentUser[0].organizationId;
        
        // Get all users in the organization
        const users = await fine.table("users")
          .select()
          .eq("organizationId", organizationId);
        
        // Get roles for all users
        const userIds = users.map(user => user.id);
        const roles = await fine.table("user_roles")
          .select()
          .in("userId", userIds);
        
        // Combine users with their roles
        const staffWithRoles = users.map(user => {
          const userRoles = roles.filter(role => role.userId === user.id);
          return {
            ...user,
            roles: userRoles,
          };
        });
        
        // Get staff details from metadata table if it exists
        try {
          const staffDetails = await fine.table("staff_details")
            .select()
            .in("userId", userIds);
          
          // Merge staff details with users
          const staffWithDetails = staffWithRoles.map(staff => {
            const details = staffDetails.find(detail => detail.userId === staff.id);
            return {
              ...staff,
              ...(details || {}),
            };
          });
          
          setStaffMembers(staffWithDetails);
          setFilteredStaff(staffWithDetails);
        } catch (error) {
          // If staff_details table doesn't exist yet, just use the staff with roles
          setStaffMembers(staffWithRoles);
          setFilteredStaff(staffWithRoles);
        }
      } catch (error) {
        console.error("Error loading staff members:", error);
        toast({
          title: "Error",
          description: "Failed to load staff members",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStaffMembers();
  }, [session?.user?.id, toast]);
  
  // Filter staff based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStaff(staffMembers);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = staffMembers.filter(staff => 
      staff.name?.toLowerCase().includes(query) || 
      staff.email.toLowerCase().includes(query) ||
      staff.specialty?.toLowerCase().includes(query)
    );
    
    setFilteredStaff(filtered);
  }, [searchQuery, staffMembers]);
  
  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setStaffDetails({
      licenseNumber: staff.licenseNumber || "",
      specialty: staff.specialty || "",
      bio: staff.bio || "",
      hireDate: staff.hireDate || "",
      status: staff.status || "active"
    });
    setIsEditDialogOpen(true);
  };
  
  const handleRoleChange = (staff: StaffMember) => {
    setSelectedStaff(staff);
    // Set the current role
    const adminRole = staff.roles?.find(role => role.role === "org_admin" || role.role === "super_admin");
    setSelectedRole((adminRole?.role === "org_admin" || adminRole?.role === "super_admin") ? adminRole.role : "user");
    setIsRoleDialogOpen(true);
  };
  
  const saveStaffDetails = async () => {
    if (!selectedStaff) return;
    
    try {
      // Check if staff_details table exists, if not create it
      try {
        await fine.table("staff_details").select().limit(1);
      } catch (error) {
        // Table doesn't exist, create it
        await fine.exec(`
          CREATE TABLE staff_details (
            id SERIAL PRIMARY KEY,
            userId TEXT NOT NULL,
            licenseNumber TEXT,
            specialty TEXT,
            bio TEXT,
            hireDate TEXT,
            status TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
      
      // Check if record exists for this user
      const existingRecord = await fine.table("staff_details")
        .select()
        .eq("userId", selectedStaff.id);
      
      if (existingRecord && existingRecord.length > 0) {
        // Update existing record
        await fine.table("staff_details")
          .update({
            licenseNumber: staffDetails.licenseNumber,
            specialty: staffDetails.specialty,
            bio: staffDetails.bio,
            hireDate: staffDetails.hireDate,
            status: staffDetails.status,
            updatedAt: new Date().toISOString()
          })
          .eq("userId", selectedStaff.id);
      } else {
        // Insert new record
        await fine.table("staff_details")
          .insert({
            userId: selectedStaff.id,
            licenseNumber: staffDetails.licenseNumber,
            specialty: staffDetails.specialty,
            bio: staffDetails.bio,
            hireDate: staffDetails.hireDate,
            status: staffDetails.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
      }
      
      // Update local state
      setStaffMembers(prev => prev.map(staff => 
        staff.id === selectedStaff.id 
          ? { ...staff, ...staffDetails } 
          : staff
      ));
      
      toast({
        title: "Success",
        description: "Staff details updated successfully",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error saving staff details:", error);
      toast({
        title: "Error",
        description: "Failed to save staff details",
        variant: "destructive",
      });
    }
  };
  
  const updateUserRole = async () => {
    if (!selectedStaff) return;
    
    try {
      // First remove any existing admin roles
      const existingRoles = await fine.table("user_roles")
        .select()
        .eq("userId", selectedStaff.id);
      
      const adminRoles = existingRoles.filter(role => 
        role.role === "org_admin" || role.role === "super_admin"
      );
      
      for (const role of adminRoles) {
        await fine.table("user_roles")
          .delete()
          .eq("id", role.id);
      }
      
      // If the new role is not "user", add it
      if (selectedRole !== "user") {
        await fine.table("user_roles")
          .insert({
            userId: selectedStaff.id,
            role: selectedRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
      }
      
      // Update local state
      setStaffMembers(prev => prev.map(staff => {
        if (staff.id === selectedStaff.id) {
          const updatedRoles = staff.roles?.filter(role => 
            role.role !== "org_admin" && role.role !== "super_admin"
          ) || [];
          
          if (selectedRole !== "user") {
            updatedRoles.push({
              userId: staff.id,
              role: selectedRole,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
          
          return { ...staff, roles: updatedRoles };
        }
        return staff;
      }));
      
      toast({
        title: "Success",
        description: `User role updated to ${selectedRole === "user" ? "regular user" : selectedRole}`,
      });
      
      setIsRoleDialogOpen(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };
  
  const getUserRole = (staff: StaffMember) => {
    if (!staff.roles) return "User";
    
    if (staff.roles.some(role => role.role === "super_admin")) {
      return "Super Admin";
    }
    
    if (staff.roles.some(role => role.role === "org_admin")) {
      return "Organization Admin";
    }
    
    return "User";
  };
  
  const getRoleBadge = (staff: StaffMember) => {
    const role = getUserRole(staff);
    
    switch (role) {
      case "Super Admin":
        return <Badge className="bg-purple-500">Super Admin</Badge>;
      case "Organization Admin":
        return <Badge className="bg-blue-500">Admin</Badge>;
      default:
        return <Badge className="bg-slate-500">User</Badge>;
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Staff Management</h1>
          
          <div className="flex gap-2">
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            
            <Button onClick={() => navigate("/admin/staff/new")}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading staff members...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <Card key={staff.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-white">
                          {staff.name ? staff.name.charAt(0).toUpperCase() : staff.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{staff.name || "Unnamed User"}</CardTitle>
                        <CardDescription className="text-sm truncate max-w-[200px]">
                          {staff.email}
                        </CardDescription>
                      </div>
                    </div>
                    {getRoleBadge(staff)}
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  {staff.specialty && (
                    <p className="text-sm mb-1"><span className="font-medium">Specialty:</span> {staff.specialty}</p>
                  )}
                  
                  {staff.licenseNumber && (
                    <p className="text-sm mb-1"><span className="font-medium">License:</span> {staff.licenseNumber}</p>
                  )}
                  
                  {staff.hireDate && (
                    <p className="text-sm mb-1"><span className="font-medium">Hire Date:</span> {staff.hireDate}</p>
                  )}
                  
                  {staff.status && (
                    <p className="text-sm mb-1">
                      <span className="font-medium">Status:</span>{" "}
                      <Badge className={staff.status === "active" ? "bg-green-500" : "bg-red-500"}>
                        {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                      </Badge>
                    </p>
                  )}
                  
                  {staff.bio && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Bio:</p>
                      <p className="text-sm line-clamp-3">{staff.bio}</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditStaff(staff)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Details
                  </Button>
                  
                  {(isAdmin || isSuperAdmin) && (
                    <Button variant="outline" size="sm" onClick={() => handleRoleChange(staff)}>
                      <UserCheck className="h-4 w-4 mr-1" />
                      Manage Role
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
            
            {filteredStaff.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No staff members found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try a different search term" : "Add staff members to get started"}
                </p>
                <Button onClick={() => navigate("/admin/staff/new")}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Edit Staff Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff Details</DialogTitle>
            <DialogDescription>
              Update professional information for {selectedStaff?.name || selectedStaff?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="licenseNumber" className="text-right text-sm font-medium">
                License #
              </label>
              <Input
                id="licenseNumber"
                value={staffDetails.licenseNumber}
                onChange={(e) => setStaffDetails(prev => ({ ...prev, licenseNumber: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="specialty" className="text-right text-sm font-medium">
                Specialty
              </label>
              <Input
                id="specialty"
                value={staffDetails.specialty}
                onChange={(e) => setStaffDetails(prev => ({ ...prev, specialty: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="hireDate" className="text-right text-sm font-medium">
                Hire Date
              </label>
              <Input
                id="hireDate"
                type="date"
                value={staffDetails.hireDate}
                onChange={(e) => setStaffDetails(prev => ({ ...prev, hireDate: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right text-sm font-medium">
                Status
              </label>
              <Select
                value={staffDetails.status}
                onValueChange={(value: "active" | "inactive") => 
                  setStaffDetails(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="bio" className="text-right text-sm font-medium pt-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={staffDetails.bio}
                onChange={(e) => setStaffDetails(prev => ({ ...prev, bio: e.target.value }))}
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveStaffDetails}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedStaff?.name || selectedStaff?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <Select
              value={selectedRole}
              onValueChange={(value: "user" | "org_admin" | "super_admin") => setSelectedRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Regular User</SelectItem>
                <SelectItem value="org_admin">Organization Admin</SelectItem>
                {isSuperAdmin && (
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Role Permissions:</h4>
              <ul className="text-sm space-y-1">
                {selectedRole === "user" && (
                  <>
                    <li>• Can manage their own appointments</li>
                    <li>• Can view their own analytics</li>
                    <li>• Cannot access admin features</li>
                  </>
                )}
                
                {selectedRole === "org_admin" && (
                  <>
                    <li>• Can manage all appointments in the organization</li>
                    <li>• Can manage users and staff</li>
                    <li>• Can access organization analytics</li>
                    <li>• Can manage organization settings</li>
                  </>
                )}
                
                {selectedRole === "super_admin" && (
                  <>
                    <li>• Has full access to all features</li>
                    <li>• Can manage multiple organizations</li>
                    <li>• Can create and delete organizations</li>
                    <li>• Can manage system-wide settings</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateUserRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedStaffManagement = () => (
  <ProtectedRoute Component={StaffManagement} />
);

export default ProtectedStaffManagement;