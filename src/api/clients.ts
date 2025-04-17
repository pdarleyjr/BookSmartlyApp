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
    failed: { row: number; data: Record<string, unknown>; error: string }[];
  }> => {
    return new Promise((resolve, reject) => {
      const successful: Schema["clients"][] = [];
      const failed: { row: number; data: Record<string, unknown>; error: string }[] = [];
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const rows = results.data;
            
            // Detect if this is a Square CSV format
            const isSquareFormat = detectSquareFormat(rows[0] as Record<string, unknown>);
            
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i] as Record<string, unknown>;
              
              try {
                let clientData: CreateClientDto;
                
                if (isSquareFormat) {
                  // Process Square CSV format
                  clientData = processSquareRow(row, organizationId);
                } else {
                  // Process standard CSV format
                  // Only require name field, everything else is optional
                  if (!row.name) {
                    failed.push({ row: i + 1, data: row, error: "Name is required" });
                    continue;
                  }
                  
                  // Create client object with whatever fields are available
                  clientData = {
                    name: row.name as string,
                    organizationId,
                    // Map any available fields from the CSV
                    email: (row.email as string) || null,
                    phone: (row.phone as string) || (row.phoneNumber as string) || (row.contact as string) || null,
                    cellPhone: (row.cellPhone as string) || (row.mobilePhone as string) || (row.mobile as string) || (row.cell as string) || null,
                    workPhone: (row.workPhone as string) || (row.businessPhone as string) || (row.officePhone as string) || null,
                    fax: (row.fax as string) || (row.faxNumber as string) || null,
                    address: (row.address as string) || (row.location as string) || (row.streetAddress as string) || null,
                    city: (row.city as string) || null,
                    state: (row.state as string) || (row.province as string) || (row.region as string) || null,
                    zipCode: (row.zipCode as string) || (row.postalCode as string) || (row.zip as string) || null,
                    country: (row.country as string) || null,
                    dateOfBirth: (row.dateOfBirth as string) || (row.dob as string) || (row.birthdate as string) || (row.birthday as string) || null,
                    gender: (row.gender as string) || (row.sex as string) || null,
                    occupation: (row.occupation as string) || (row.job as string) || (row.profession as string) || null,
                    company: (row.company as string) || (row.organization as string) || (row.employer as string) || null,
                    referredBy: (row.referredBy as string) || (row.referral as string) || (row.referralSource as string) || null,
                    emergencyContact: (row.emergencyContact as string) || (row.emergency as string) || null,
                    emergencyPhone: (row.emergencyPhone as string) || (row.emergencyContactPhone as string) || null,
                    insuranceProvider: (row.insuranceProvider as string) || (row.insurance as string) || (row.provider as string) || null,
                    insuranceId: (row.insuranceId as string) || (row.policyNumber as string) || (row.insuranceNumber as string) || null,
                    notes: (row.notes as string) || (row.comments as string) || (row.description as string) || null
                  };
                }
                
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

/**
 * Detects if the CSV is in Square format by checking for specific column headers
 */
function detectSquareFormat(row: Record<string, unknown>): boolean {
  // Check for Square-specific column headers
  return (
    row["First Name"] !== undefined &&
    row["Last Name"] !== undefined &&
    row["Square Customer ID"] !== undefined
  );
}

/**
 * Process a row from a Square CSV format
 */
function processSquareRow(row: Record<string, unknown>, organizationId?: number | null): CreateClientDto {
  // Combine first and last name
  const firstName = (row["First Name"] as string) || "";
  let lastName = (row["Last Name"] as string) || "";
  let dateOfBirth: string | null = null;
  let notes: string | null = null;
  
  // Extract DOB from last name if it contains "DOB:" pattern
  const dobMatch = lastName.match(/- DOB: (\d{1,2}\/\d{1,2}\/\d{4})/);
  if (dobMatch) {
    dateOfBirth = dobMatch[1]; // Extract the date
    lastName = lastName.replace(/- DOB: \d{1,2}\/\d{1,2}\/\d{4}/, "").trim(); // Remove DOB from last name
  }
  
  // Process Birthday field if present and DOB wasn't found in the last name
  if (!dateOfBirth && row["Birthday"]) {
    // Try to convert text format like "January 2" to a date
    try {
      const birthdayText = row["Birthday"] as string;
      if (birthdayText && birthdayText.trim() !== "") {
        // If it's just month and day, we'll use it as is
        dateOfBirth = birthdayText;
      }
    } catch (e) {
      console.error("Error parsing birthday:", e);
    }
  }
  
  // Clean up phone number (remove '+' prefix and quotes)
  let phone = (row["Phone Number"] as string) || null;
  if (phone) {
    phone = phone.replace(/^'+|'+$/g, ""); // Remove quotes
    phone = phone.replace(/^\+/, ""); // Remove leading +
  }
  
  // Combine address fields
  let address = (row["Street Address 1"] as string) || null;
  const streetAddress2 = row["Street Address 2"] as string | undefined;
  if (streetAddress2 && streetAddress2.trim() !== "") {
    address = address ? `${address}, ${streetAddress2}` : streetAddress2;
  }
  
  // Process Memo field for notes
  const memo = row["Memo"] as string | undefined;
  if (memo && memo.trim() !== "") {
    notes = memo;
  }
  
  // Add Square-specific information to notes
  const squareInfo = [];
  if (row["Square Customer ID"]) squareInfo.push(`Square Customer ID: ${row["Square Customer ID"]}`);
  if (row["Creation Source"]) squareInfo.push(`Creation Source: ${row["Creation Source"]}`);
  if (row["First Visit"]) squareInfo.push(`First Visit: ${row["First Visit"]}`);
  if (row["Last Visit"]) squareInfo.push(`Last Visit: ${row["Last Visit"]}`);
  if (row["Transaction Count"]) squareInfo.push(`Transaction Count: ${row["Transaction Count"]}`);
  if (row["Total Spend"]) squareInfo.push(`Total Spend: ${row["Total Spend"]}`);
  
  if (squareInfo.length > 0) {
    const squareInfoText = "Square Information:\n" + squareInfo.join("\n");
    notes = notes ? `${notes}\n\n${squareInfoText}` : squareInfoText;
  }
  
  return {
    name: `${firstName} ${lastName}`.trim(),
    organizationId,
    email: (row["Email Address"] as string) || null,
    phone: phone,
    cellPhone: null, // Square doesn't have a specific cell phone field
    workPhone: null, // Square doesn't have a specific work phone field
    fax: null, // Square doesn't have a fax field
    address: address,
    city: (row["City"] as string) || null,
    state: (row["State"] as string) || null,
    zipCode: (row["Postal Code"] as string) || null,
    country: (row["Country"] as string) || null,
    dateOfBirth: dateOfBirth,
    gender: null, // Square doesn't have a gender field
    occupation: null, // Square doesn't have an occupation field
    company: (row["Company Name"] as string) || null,
    referredBy: (row["Referred By"] as string) || null,
    emergencyContact: null, // Square doesn't have emergency contact fields
    emergencyPhone: null,
    insuranceProvider: null, // Square doesn't have insurance fields
    insuranceId: null,
    notes: notes
  };
}