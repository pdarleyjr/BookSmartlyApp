import { fine } from "@/lib/fine";
import type { Schema } from "@/lib/db-types";

// Type for creating a new appointment
export type CreateAppointmentDto = Omit<Schema["appointments"], "id" | "createdAt" | "updatedAt">;

// Type for updating an appointment
export type UpdateAppointmentDto = Partial<Omit<Schema["appointments"], "id" | "userId" | "createdAt" | "updatedAt">>;

/**
 * Appointments API service
 */
export const appointmentsApi = {
  /**
   * Get all appointments for a user
   * @param userId - The user ID
   * @returns Promise with appointments array
   */
  getAppointments: async (userId: string): Promise<Schema["appointments"][]> => {
    try {
      // Check if the user is authenticated
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      try {
        const data = await fine.table("appointments")
          .select()
          .eq("userId", userId)
          .order("startTime", { ascending: true });
        return data || [];
      } catch (error: any) {
        console.error("Database error fetching appointments:", error);
        // If there's a database error, it might be because the table doesn't exist yet
        return [];
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  /**
   * Get a single appointment by ID
   * @param id - The appointment ID
   * @param userId - The user ID (for authorization)
   * @returns Promise with appointment data
   */
  getAppointmentById: async (id: number, userId: string): Promise<Schema["appointments"] | null> => {
    try {
      // Check if the user is authenticated
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      try {
        const data = await fine.table("appointments")
          .select()
          .eq("id", id)
          .eq("userId", userId);
        
        return data && data.length > 0 ? data[0] : null;
      } catch (error: any) {
        console.error(`Database error fetching appointment ${id}:`, error);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new appointment
   * @param appointment - The appointment data
   * @returns Promise with the created appointment
   */
  createAppointment: async (appointment: CreateAppointmentDto): Promise<Schema["appointments"]> => {
    try {
      // Check if the user is authenticated
      if (!appointment.userId) {
        throw new Error("User ID is required");
      }
      
      const newAppointment = {
        ...appointment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      try {
        const data = await fine.table("appointments").insert(newAppointment).select();
        
        if (!data || data.length === 0) {
          throw new Error("Failed to create appointment");
        }
        
        return data[0];
      } catch (error: any) {
        console.error("Database error creating appointment:", error);
        throw new Error(`Failed to create appointment: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  /**
   * Update an existing appointment
   * @param id - The appointment ID
   * @param appointment - The updated appointment data
   * @param userId - The user ID (for authorization)
   * @returns Promise with the updated appointment
   */
  updateAppointment: async (
    id: number, 
    appointment: UpdateAppointmentDto,
    userId: string
  ): Promise<Schema["appointments"]> => {
    try {
      // Check if the user is authenticated
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      try {
        // First verify the appointment belongs to the user
        const existing = await fine.table("appointments")
          .select("id")
          .eq("id", id)
          .eq("userId", userId);
        
        if (!existing || existing.length === 0) {
          throw new Error("Appointment not found or unauthorized");
        }
        
        const updatedAppointment = {
          ...appointment,
          updatedAt: new Date().toISOString(),
        };
        
        const data = await fine.table("appointments")
          .update(updatedAppointment)
          .eq("id", id)
          .select();
        
        if (!data || data.length === 0) {
          throw new Error("Failed to update appointment");
        }
        
        return data[0];
      } catch (error: any) {
        console.error(`Database error updating appointment ${id}:`, error);
        throw new Error(`Failed to update appointment: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an appointment
   * @param id - The appointment ID
   * @param userId - The user ID (for authorization)
   * @returns Promise with success status
   */
  deleteAppointment: async (id: number, userId: string): Promise<void> => {
    try {
      // Check if the user is authenticated
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      try {
        // First verify the appointment belongs to the user
        const existing = await fine.table("appointments")
          .select("id")
          .eq("id", id)
          .eq("userId", userId);
        
        if (!existing || existing.length === 0) {
          throw new Error("Appointment not found or unauthorized");
        }
        
        await fine.table("appointments")
          .delete()
          .eq("id", id);
      } catch (error: any) {
        console.error(`Database error deleting appointment ${id}:`, error);
        throw new Error(`Failed to delete appointment: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get appointments for a specific date range
   * @param userId - The user ID
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns Promise with appointments array
   */
  getAppointmentsByDateRange: async (
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Schema["appointments"][]> => {
    try {
      // Check if the user is authenticated
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      try {
        // Using a simpler query to avoid potential issues
        const allUserAppointments = await fine.table("appointments")
          .select()
          .eq("userId", userId);
        
        // Filter on the client side to avoid complex query issues
        const startDateTime = new Date(startDate).getTime();
        const endDateTime = new Date(endDate).getTime();
        
        return allUserAppointments.filter(appointment => {
          try {
            const appointmentTime = new Date(appointment.startTime).getTime();
            return appointmentTime >= startDateTime && appointmentTime <= endDateTime;
          } catch (e) {
            return false;
          }
        }).sort((a, b) => {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
      } catch (error: any) {
        console.error("Database error fetching appointments by date range:", error);
        return [];
      }
    } catch (error) {
      console.error("Error fetching appointments by date range:", error);
      throw error;
    }
  }
};