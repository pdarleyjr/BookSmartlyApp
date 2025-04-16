import { fine } from "@/lib/fine";
import type { Schema } from "@/lib/db-types";
import Papa from 'papaparse';

export type CreateClientDto = Omit<Schema["clients"], "id" | "createdAt" | "updatedAt">;
export type UpdateClientDto = Partial<Omit<Schema["clients"], "id" | "createdAt" | "updatedAt">>;

export const clientsApi = {
  /**
   * Get all clients for an organization
   * @param organizationId - The organization ID
   * @returns Promise with clients array
   */
  getClients: async (organizationId?: number | null): Promise<Schema["clients"][]> => {
    try {
      if (organizationId) {
        // Get organization-specific clients
        return await fine.table("clients")
          .select()
          .eq("organizationId", organizationId)
          .order("name", { ascending: true });
      } else {
        // Get personal clients (no organization)
        return await fine.table("clients")
          .select()
          .eq("organizationId", null)
          .order("name", { ascending: true });
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
  },

  /**
   * Get a client by ID
   * @param id - The client ID
   * @returns Promise with client data
   */
  getClientById: async (id: number): Promise<Schema["clients"] | null> => {
    try {
      const data = await fine.table("clients")
        .select()
        .eq("id", id);
      
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new client
   * @param client - The client data
   * @returns Promise with the created client
   */
  createClient: async (client: CreateClientDto): Promise<Schema["clients"]> => {
    try {
      const newClient = {
        ...client,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const data = await fine.table("clients").insert(newClient).select();
      
      if (!data || data.length === 0) {
        throw new Error("Failed to create client");
      }
      
      return data[0];
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  },

  /**
   * Update an existing client
   * @param id - The client ID
   * @param client - The updated client data
   * @returns Promise with the updated client
   */
  updateClient: async (
    id: number, 
    client: UpdateClientDto
  ): Promise<Schema["clients"]> => {
    try {
      const updatedClient = {
        ...client,
        updatedAt: new Date().toISOString(),
      };
      
      const data = await fine.table("clients")
        .update(updatedClient)
        .eq("id", id)
        .select();
      
      if (!data || data.length === 0) {
        throw new Error("Failed to update client");
      }
      
      return data[0];
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a client
   * @param id - The client ID
   * @returns Promise with success status
   */
  deleteClient: async (id: number): Promise<void> => {
    try {
      await fine.table("clients")
        .delete()
        .eq("id", id);
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      throw error;
    }
  },

  /**
   * Import clients from CSV
   * @param file - The CSV file
   * @param organizationId - The organization ID
   * @returns Promise with the imported clients
   */
  importClientsFromCsv: async (file: File, organizationId?: number | null): Promise<{
    successful: Schema["clients"][];
    failed: { row: number; data: any; error: string }[];
  }> => {
    return new Promise((resolve, reject) => {
      const successful: Schema["clients"][] = [];
      const failed: { row: number; data: any; error: string }[] = [];
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const rows = results.data;
            
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i] as any;
              
              try {
                // Validate required fields
                if (!row.name) {
                  failed.push({ row: i + 1, data: row, error: "Name is required" });
                  continue;
                }
                
                // Create client object
                const clientData: CreateClientDto = {
                  name: row.name,
                  email: row.email || null,
                  phone: row.phone || null,
                  address: row.address || null,
                  dateOfBirth: row.dateOfBirth || row.dob || null,
                  notes: row.notes || null,
                  organizationId
                };
                
                // Insert client
                const newClient = await clientsApi.createClient(clientData);
                successful.push(newClient);
              } catch (error) {
                failed.push({ 
                  row: i + 1, 
                  data: row, 
                  error: error instanceof Error ? error.message : "Unknown error" 
                });
              }
            }
            
            resolve({ successful, failed });
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
};