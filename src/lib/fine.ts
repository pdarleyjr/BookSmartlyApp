import { FineClient } from "@fine-dev/fine-js";
import type { Schema } from "./db-types.ts";

// Get the Fine.dev endpoint URL from environment variables or use the default
const FINE_ENDPOINT = import.meta.env.VITE_FINE_ENDPOINT || "https://platform.fine.dev/customer-cautious-staff-loyal-similar-pan";

// Initialize the Fine.dev client with the schema type
export const fine = new FineClient<Schema>(FINE_ENDPOINT);

// Export a helper function to check if a user has admin role
export const isAdmin = async (userId: string | undefined): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const roles = await fine.table("user_roles")
      .select()
      .eq("userId", userId)
      .eq("role", "org_admin");
    
    return roles.length > 0;
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
};

// Export a helper function to check if a user has super admin role
export const isSuperAdmin = async (userId: string | undefined): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const roles = await fine.table("user_roles")
      .select()
      .eq("userId", userId)
      .eq("role", "super_admin");
    
    return roles.length > 0;
  } catch (error) {
    console.error("Error checking super admin role:", error);
    return false;
  }
};