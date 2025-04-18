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
    name?: string | null;
    organizationId?: number | null;
    organizationApproved?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  user_roles: {
    id?: number;
    userId: string;
    role: 'user' | 'admin' | 'org_admin' | 'super_admin';
    createdAt?: string;
    updatedAt?: string;
  };
  invoices: {
    id?: number;
    appointmentIds: number[];
    clientId?: number | null;
    clientName: string;
    amount: number;
    status: 'draft' | 'sent' | 'paid' | 'cancelled';
    createdAt?: string;
    updatedAt?: string;
    paidAt?: string | null;
    squareInvoiceId?: string | null;
    squareInvoiceUrl?: string | null;
  };
  clients: {
    id?: number;
    userId: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}