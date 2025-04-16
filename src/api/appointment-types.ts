import { fine } from "@/lib/fine";
import type { Schema } from "@/lib/db-types";

export type CreateAppointmentTypeDto = Omit<Schema["appointment_types"], "id" | "createdAt" | "updatedAt">;
export type UpdateAppointmentTypeDto = Partial<Omit<Schema["appointment_types"], "id" | "createdAt" | "updatedAt">>;

export const appointmentTypesApi = {
  /**
   * Get all appointment types for an organization
   * @param organizationId - The organization ID
   * @returns Promise with appointment types array
   */
  getAppointmentTypes: async (organizationId?: number | null): Promise<Schema["appointment_types"][]> => {
    try {
      if (organizationId) {
        // Get organization-specific appointment types
        return await fine.table("appointment_types")
          .select()
          .eq("organizationId", organizationId)
          .order("name", { ascending: true });
      } else {
        // Get personal appointment types (no organization)
        return await fine.table("appointment_types")
          .select()
          .eq("organizationId", null)
          .order("name", { ascending: true });
      }
    } catch (error) {
      console.error("Error fetching appointment types:", error);
      return [];
    }
  },

  /**
   * Get an appointment type by ID
   * @param id - The appointment type ID
   * @returns Promise with appointment type data
   */
  getAppointmentTypeById: async (id: number): Promise<Schema["appointment_types"] | null> => {
    try {
      const data = await fine.table("appointment_types")
        .select()
        .eq("id", id);
      
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Error fetching appointment type ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new appointment type
   * @param appointmentType - The appointment type data
   * @returns Promise with the created appointment type
   */
  createAppointmentType: async (appointmentType: CreateAppointmentTypeDto): Promise<Schema["appointment_types"]> => {
    try {
      const newAppointmentType = {
        ...appointmentType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const data = await fine.table("appointment_types").insert(newAppointmentType).select();
      
      if (!data || data.length === 0) {
        throw new Error("Failed to create appointment type");
      }
      
      return data[0];
    } catch (error) {
      console.error("Error creating appointment type:", error);
      throw error;
    }
  },

  /**
   * Update an existing appointment type
   * @param id - The appointment type ID
   * @param appointmentType - The updated appointment type data
   * @returns Promise with the updated appointment type
   */
  updateAppointmentType: async (
    id: number, 
    appointmentType: UpdateAppointmentTypeDto
  ): Promise<Schema["appointment_types"]> => {
    try {
      const updatedAppointmentType = {
        ...appointmentType,
        updatedAt: new Date().toISOString(),
      };
      
      const data = await fine.table("appointment_types")
        .update(updatedAppointmentType)
        .eq("id", id)
        .select();
      
      if (!data || data.length === 0) {
        throw new Error("Failed to update appointment type");
      }
      
      return data[0];
    } catch (error) {
      console.error(`Error updating appointment type ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an appointment type
   * @param id - The appointment type ID
   * @returns Promise with success status
   */
  deleteAppointmentType: async (id: number): Promise<void> => {
    try {
      await fine.table("appointment_types")
        .delete()
        .eq("id", id);
    } catch (error) {
      console.error(`Error deleting appointment type ${id}:`, error);
      throw error;
    }
  }
};