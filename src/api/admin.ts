import { fine } from "@/lib/fine";
import { organizationsApi } from "@/api/organizations";
import type { Schema } from "@/lib/db-types";

export type UserWithRole = Schema["users"] & {
  role?: Schema["user_roles"]["role"];
  organizationName?: string;
};

export const adminApi = {
  /**
   * Check if a user has admin privileges
   * @param userId - The user ID
   * @returns Promise with admin status and role
   */
  checkAdminStatus: async (userId: string): Promise<{ 
    isAdmin: boolean; 
    isSuperAdmin: boolean;
    isOrgAdmin: boolean;
    role: Schema["user_roles"]["role"] | null;
    organizationId: number | null;
  }> => {
    try {
      // Get user role
      let role = null;
      let organizationId = null;
      
      try {
        // Try to get role from user_roles table
        const roles = await fine.table("user_roles")
          .select()
          .eq("userId", userId);
        
        role = roles && roles.length > 0 ? roles[0].role : null;
      } catch (error) {
        // Table might not exist yet, check if user email matches super admin
        try {
          const users = await fine.table("users")
            .select("email")
            .eq("id", userId);
          
          if (users && users.length > 0 && users[0].email === 'pdarleyjr@gmail.com') {
            role = 'super_admin';
          }
        } catch (userError) {
          // Users table might not exist yet
          console.log("users table might not exist yet");
          
          // Special case for pdarleyjr@gmail.com - always super admin
          // Since we can't check the email, we'll have to rely on the session data
          // This will be handled in the useAdminStatus hook
        }
      }
      
      // Try to get user's organization
      try {
        const users = await fine.table("users")
          .select("organizationId")
          .eq("id", userId);
        
        organizationId = users && users.length > 0 ? users[0].organizationId : null;
      } catch (error) {
        // organizationId column might not exist yet
        organizationId = null;
      }
      
      return {
        isAdmin: role === 'super_admin' || role === 'org_admin',
        isSuperAdmin: role === 'super_admin',
        isOrgAdmin: role === 'org_admin',
        role,
        organizationId
      };
    } catch (error) {
      console.error("Error checking admin status:", error);
      
      // Special case for pdarleyjr@gmail.com - always return super admin
      if (userId) {
        try {
          const users = await fine.table("users")
            .select("email")
            .eq("id", userId);
          
          if (users && users.length > 0 && users[0].email === 'pdarleyjr@gmail.com') {
            return {
              isAdmin: true,
              isSuperAdmin: true,
              isOrgAdmin: false,
              role: 'super_admin',
              organizationId: null
            };
          }
        } catch (e) {
          // Ignore error - users table might not exist yet
        }
      }
      
      return {
        isAdmin: false,
        isSuperAdmin: false,
        isOrgAdmin: false,
        role: null,
        organizationId: null
      };
    }
  },

  /**
   * Get all users (for super admin)
   * @returns Promise with users array
   */
  getAllUsers: async (): Promise<UserWithRole[]> => {
    try {
      // Get all users
      let users = [];
      try {
        users = await fine.table("users").select();
      } catch (error) {
        console.error("Error fetching users, table might not exist yet:", error);
        return [];
      }
      
      // Get all roles (if table exists)
      let roles: any[] = [];
      try {
        roles = await fine.table("user_roles").select();
      } catch (error) {
        // Table might not exist yet
        console.log("user_roles table might not exist yet");
      }
      
      // Get all organizations (if table exists)
      let organizations: any[] = [];
      try {
        organizations = await fine.table("organizations").select();
      } catch (error) {
        // Table might not exist yet
        console.log("organizations table might not exist yet");
      }
      
      // Map roles and organizations to users
      return users.map(user => {
        const userRole = roles.find(r => r.userId === user.id);
        const organization = user.organizationId 
          ? organizations.find(o => o.id === user.organizationId)
          : null;
        
        // Special case for pdarleyjr@gmail.com
        const isSuperAdmin = user.email === 'pdarleyjr@gmail.com';
        
        return {
          ...user,
          role: userRole?.role || (isSuperAdmin ? 'super_admin' : undefined),
          organizationName: organization?.name
        };
      });
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  },

  /**
   * Get users in an organization (for org admin)
   * @param organizationId - The organization ID
   * @returns Promise with users array
   */
  getOrganizationUsers: async (organizationId: number): Promise<UserWithRole[]> => {
    try {
      // Get users in organization
      let users: any[] = [];
      try {
        users = await fine.table("users")
          .select()
          .eq("organizationId", organizationId);
      } catch (error) {
        // organizationId column might not exist yet
        console.error("Error fetching organization users, table might not exist yet:", error);
        return [];
      }
      
      if (users.length === 0) return [];
      
      // Get roles for these users (if table exists)
      const userIds = users.map(user => user.id);
      let roles: any[] = [];
      try {
        roles = await fine.table("user_roles")
          .select()
          .in("userId", userIds);
      } catch (error) {
        // Table might not exist yet
      }
      
      // Get organization name (if table exists)
      let organizationName = null;
      try {
        const organizations = await fine.table("organizations")
          .select()
          .eq("id", organizationId);
        
        organizationName = organizations && organizations.length > 0 
          ? organizations[0].name 
          : null;
      } catch (error) {
        // Table might not exist yet
      }
      
      // Map roles to users
      return users.map(user => {
        const userRole = roles.find(r => r.userId === user.id);
        const isSuperAdmin = user.email === 'pdarleyjr@gmail.com';
        
        return {
          ...user,
          role: userRole?.role || (isSuperAdmin ? 'super_admin' : undefined),
          organizationName
        };
      });
    } catch (error) {
      console.error(`Error fetching users for organization ${organizationId}:`, error);
      return [];
    }
  },

  /**
   * Get all appointments (for super admin)
   * @returns Promise with appointments array
   */
  getAllAppointments: async (): Promise<(Schema["appointments"] & { userName?: string })[]> => {
    try {
      // Get all appointments
      let appointments = [];
      try {
        appointments = await fine.table("appointments").select();
      } catch (error) {
        console.error("Error fetching appointments, table might not exist yet:", error);
        return [];
      }
      
      // Get all users to map names
      let users = [];
      try {
        users = await fine.table("users").select("id, name");
      } catch (error) {
        console.error("Error fetching users, table might not exist yet:", error);
        return appointments;
      }
      
      // Map user names to appointments
      return appointments.map(appointment => {
        const user = users.find(u => u.id === appointment.userId);
        
        return {
          ...appointment,
          userName: user?.name
        };
      });
    } catch (error) {
      console.error("Error fetching all appointments:", error);
      return [];
    }
  },

  /**
   * Get appointments for an organization (for org admin)
   * @param organizationId - The organization ID
   * @returns Promise with appointments array
   */
  getOrganizationAppointments: async (organizationId: number): Promise<(Schema["appointments"] & { userName?: string })[]> => {
    try {
      // Get users in organization
      let users: any[] = [];
      try {
        users = await fine.table("users")
          .select("id, name")
          .eq("organizationId", organizationId);
      } catch (error) {
        // organizationId column might not exist yet
        console.error("Error fetching organization users, table might not exist yet:", error);
        return [];
      }
      
      if (users.length === 0) return [];
      
      const userIds = users.map(user => user.id);
      
      // Get appointments for these users
      let appointments = [];
      try {
        appointments = await fine.table("appointments")
          .select()
          .in("userId", userIds);
      } catch (error) {
        console.error("Error fetching appointments, table might not exist yet:", error);
        return [];
      }
      
      // Map user names to appointments
      return appointments.map(appointment => {
        const user = users.find(u => u.id === appointment.userId);
        
        return {
          ...appointment,
          userName: user?.name
        };
      });
    } catch (error) {
      console.error(`Error fetching appointments for organization ${organizationId}:`, error);
      return [];
    }
  },

  /**
   * Update user role
   * @param userId - The user ID
   * @param role - The new role
   * @returns Promise with success status
   */
  updateUserRole: async (userId: string, role: Schema["user_roles"]["role"]): Promise<boolean> => {
    try {
      // First check if user_roles table exists
      try {
        // Check if user already has a role
        const existingRoles = await fine.table("user_roles")
          .select()
          .eq("userId", userId);
        
        if (existingRoles && existingRoles.length > 0) {
          // Update existing role
          await fine.table("user_roles")
            .update({ role, updatedAt: new Date().toISOString() })
            .eq("userId", userId);
        } else {
          // Create new role
          await fine.table("user_roles").insert({
            userId,
            role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        return true;
      } catch (error) {
        // Table might not exist yet, create it first
        console.error("Error updating role, table might not exist:", error);
        return false;
      }
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error);
      return false;
    }
  },

  /**
   * Update user organization
   * @param userId - The user ID
   * @param organizationId - The organization ID
   * @param approved - Whether the user is approved (defaults to false for new requests)
   * @returns Promise with success status
   */
  updateUserOrganization: async (
    userId: string,
    organizationId: number | null,
    approved: boolean = false
  ): Promise<boolean> => {
    try {
      try {
        await fine.table("users")
          .update({
            organizationId,
            organizationApproved: approved,
            updatedAt: new Date().toISOString()
          })
          .eq("id", userId);
        
        return true;
      } catch (error) {
        // organizationId column might not exist yet
        console.error("Error updating organization, column might not exist:", error);
        return false;
      }
    } catch (error) {
      console.error(`Error updating organization for user ${userId}:`, error);
      return false;
    }
  },

  /**
   * Approve a user's organization access
   * @param userId - The user ID to approve
   * @returns Promise with success status
   */
  approveUserOrganization: async (userId: string): Promise<boolean> => {
    try {
      await fine.table("users")
        .update({
          organizationApproved: true,
          updatedAt: new Date().toISOString()
        })
        .eq("id", userId);
      
      return true;
    } catch (error) {
      console.error(`Error approving user ${userId}:`, error);
      return false;
    }
  },

  /**
   * Create a new organization
   * @param name - The organization name
   * @returns Promise with the created organization
   */
  createOrganization: async (name: string): Promise<Schema["organizations"] | null> => {
    try {
      return await organizationsApi.createOrganization(name);
    } catch (error) {
      console.error(`Error creating organization ${name}:`, error);
      return null;
    }
  },

  /**
   * Get all organizations
   * @returns Promise with organizations array
   */
  getAllOrganizations: async (): Promise<Schema["organizations"][]> => {
    try {
      try {
        return await fine.table("organizations").select();
      } catch (error) {
        // Table might not exist yet
        console.error("Error fetching organizations, table might not exist:", error);
        return [];
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  },
  
  /**
   * Get organization details including access code
   * @param organizationId - The organization ID
   * @returns Promise with organization details
   */
  getOrganizationDetails: async (organizationId: number): Promise<Schema["organizations"] | null> => {
    try {
      const orgs = await fine.table("organizations")
        .select()
        .eq("id", organizationId);
      
      return orgs && orgs.length > 0 ? orgs[0] : null;
    } catch (error) {
      console.error(`Error fetching organization ${organizationId}:`, error);
      return null;
    }
  },
  
  /**
   * Regenerate organization access code
   * @param organizationId - The organization ID
   * @returns Promise with the new access code
   */
  regenerateOrganizationCode: async (organizationId: number): Promise<string | null> => {
    try {
      return await organizationsApi.regenerateAccessCode(organizationId);
    } catch (error) {
      console.error(`Error regenerating access code for organization ${organizationId}:`, error);
      return null;
    }
  },
  
  /**
   * Verify organization access code
   * @param organizationId - The organization ID
   * @param accessCode - The access code to verify
   * @returns Promise with verification result
   */
  verifyOrganizationCode: async (organizationId: number, accessCode: string): Promise<boolean> => {
    try {
      return await organizationsApi.verifyOrganizationCode(organizationId, accessCode);
    } catch (error) {
      console.error(`Error verifying access code for organization ${organizationId}:`, error);
      return false;
    }
  }
};