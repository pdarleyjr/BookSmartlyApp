import { fine } from "@/lib/fine";
import type { Schema } from "@/lib/db-types";

export type CreateLocationDto = Omit<Schema["locations"], "id" | "createdAt" | "updatedAt">;
export type UpdateLocationDto = Partial<Omit<Schema["locations"], "id" | "createdAt" | "updatedAt">>;

export const locationsApi = {
  /**
   * Get all locations for an organization
   * @param organizationId - The organization ID
   * @returns Promise with locations array
   */
  getLocations: async (organizationId?: number | null): Promise<Schema["locations"][]> => {
    try {
      if (organizationId) {
        // Get organization-specific locations
        return await fine.table("locations")
          .select()
          .eq("organizationId", organizationId)
          .order("name", { ascending: true });
      } else {
        // Get personal locations (no organization)
        return await fine.table("locations")
          .select()
          .eq("organizationId", null)
          .order("name", { ascending: true });
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
  },

  /**
   * Get a location by ID
   * @param id - The location ID
   * @returns Promise with location data
   */
  getLocationById: async (id: number): Promise<Schema["locations"] | null> => {
    try {
      const data = await fine.table("locations")
        .select()
        .eq("id", id);
      
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Error fetching location ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new location
   * @param location - The location data
   * @returns Promise with the created location
   */
  createLocation: async (location: CreateLocationDto): Promise<Schema["locations"]> => {
    try {
      const newLocation = {
        ...location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const data = await fine.table("locations").insert(newLocation).select();
      
      if (!data || data.length === 0) {
        throw new Error("Failed to create location");
      }
      
      return data[0];
    } catch (error) {
      console.error("Error creating location:", error);
      throw error;
    }
  },

  /**
   * Update an existing location
   * @param id - The location ID
   * @param location - The updated location data
   * @returns Promise with the updated location
   */
  updateLocation: async (
    id: number, 
    location: UpdateLocationDto
  ): Promise<Schema["locations"]> => {
    try {
      const updatedLocation = {
        ...location,
        updatedAt: new Date().toISOString(),
      };
      
      const data = await fine.table("locations")
        .update(updatedLocation)
        .eq("id", id)
        .select();
      
      if (!data || data.length === 0) {
        throw new Error("Failed to update location");
      }
      
      return data[0];
    } catch (error) {
      console.error(`Error updating location ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a location
   * @param id - The location ID
   * @returns Promise with success status
   */
  deleteLocation: async (id: number): Promise<void> => {
    try {
      await fine.table("locations")
        .delete()
        .eq("id", id);
    } catch (error) {
      console.error(`Error deleting location ${id}:`, error);
      throw error;
    }
  }
};