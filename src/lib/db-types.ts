export type Schema = {
  appointments: {
    id?: number;
    userId: string;
    title: string;
    description?: string | null;
    location?: string | null;
    startTime: string;
    endTime: string;
    createdAt?: string;
    updatedAt?: string;
    clientName?: string | null;
    appointmentTypeId?: number | null;
    locationId?: number | null;
    assignedToUserId?: string | null;
    price?: number | null;
    status?: 'scheduled' | 'arrived' | 'completed' | 'cancelled' | 'no-show' | null;
    billingStatus?: 'unbilled' | 'billed' | 'paid' | null;
  };
  staff_details: {
    id?: number;
    userId: string;
    licenseNumber?: string | null;
    specialty?: string | null;
    bio?: string | null;
    hireDate?: string | null;
    status?: 'active' | 'inactive' | null;
    createdAt?: string;
    updatedAt?: string;
  };
  users: {
    id: string;
    email: string;
    name?: string;
    organizationId?: number | null;
    organizationApproved?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  user_roles: {
    id?: number;
    userId: string;
    role: 'super_admin' | 'org_admin' | 'user';
    createdAt?: string;
    updatedAt?: string;
  };
  organizations: {
    id?: number;
    name: string;
    accessCode?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  appointment_types: {
    id?: number;
    organizationId?: number | null;
    name: string;
    durationMinutes: number;
    price: number;
    createdAt?: string;
    updatedAt?: string;
  };
  locations: {
    id?: number;
    organizationId?: number | null;
    name: string;
    address?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  clients: {
    id?: number;
    organizationId?: number | null;
    name: string;
    email?: string | null;
    phone?: string | null;
    cellPhone?: string | null;
    workPhone?: string | null;
    fax?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    country?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    occupation?: string | null;
    company?: string | null;
    referredBy?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    insuranceProvider?: string | null;
    insuranceId?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}