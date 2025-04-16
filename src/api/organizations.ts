import { fine } from "@/lib/fine";
import type { Schema } from "@/lib/db-types";

// Generate a random organization code
const generateOrgCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like 0, O, 1, I
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const organizationsApi = {
  /**
   * Create a new organization with a generated access code
   * @param name - Organization name
   * @returns Promise with the created organization
   */
  createOrganization: async (name: string): Promise<Schema["organizations"] & { accessCode: string } | null> => {
    try {
      const accessCode = generateOrgCode();
      
      const now = new Date().toISOString();
      const newOrg = {
        name,
        accessCode,
        createdAt: now,
        updatedAt: now
      };
      
      const orgs = await fine.table("organizations").insert(newOrg).select();
      
      return orgs && orgs.length > 0 ? orgs[0] : null;
    } catch (error) {
      console.error(`Error creating organization ${name}:`, error);
      return null;
    }
  },

  /**
   * Verify an organization access code
   * @param organizationId - Organization ID
   * @param accessCode - Access code to verify
   * @returns Promise with verification result
   */
  verifyOrganizationCode: async (organizationId: number, accessCode: string): Promise<boolean> => {
    try {
      const orgs = await fine.table("organizations")
        .select()
        .eq("id", organizationId)
        .eq("accessCode", accessCode);
      
      return orgs && orgs.length > 0;
    } catch (error) {
      console.error(`Error verifying organization code:`, error);
      return false;
    }
  },

  /**
   * Generate a new access code for an organization
   * @param organizationId - Organization ID
   * @returns Promise with the new access code
   */
  regenerateAccessCode: async (organizationId: number): Promise<string | null> => {
    try {
      const accessCode = generateOrgCode();
      
      await fine.table("organizations")
        .update({ 
          accessCode,
          updatedAt: new Date().toISOString()
        })
        .eq("id", organizationId);
      
      return accessCode;
    } catch (error) {
      console.error(`Error regenerating access code:`, error);
      return null;
    }
  }
};