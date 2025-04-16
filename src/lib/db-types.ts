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
  };
}