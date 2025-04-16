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
    address?: string | null;
    dateOfBirth?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}