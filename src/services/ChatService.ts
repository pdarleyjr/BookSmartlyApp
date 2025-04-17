import OpenAI from "openai";
import { fine } from "../lib/fine";
import { appointmentsApi } from "../api/appointments";
import type { Schema } from "../lib/db-types";
import type { ChatCompletionMessageParam } from "openai/resources";

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });

// Define function schemas for OpenAI
const functions = [
  {
    name: "createAppointment",
    description: "Schedule a new appointment in BookSmartly",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string" },
        title: { type: "string" },
        startTime: { type: "string", format: "date-time" },
        endTime: { type: "string", format: "date-time" },
        clientName: { type: "string" },
        locationId: { type: "integer" },
        assignedToUserId: { type: "string" },
        price: { type: "number" }
      },
      required: ["userId", "title", "startTime", "endTime"]
    }
  },
  {
    name: "cancelAppointment",
    description: "Cancel an existing appointment",
    parameters: {
      type: "object",
      properties: {
        id: { type: "integer" },
        userId: { type: "string" }
      },
      required: ["id", "userId"]
    }
  },
  {
    name: "rescheduleAppointment",
    description: "Reschedule an existing appointment to a new time",
    parameters: {
      type: "object",
      properties: {
        id: { type: "integer" },
        userId: { type: "string" },
        newStart: { type: "string", format: "date-time" },
        newEnd: { type: "string", format: "date-time" }
      },
      required: ["id", "userId", "newStart", "newEnd"]
    }
  },
  {
    name: "getFinancialAnalytics",
    description: "Get financial analytics for an organization, user, or location",
    parameters: {
      type: "object",
      properties: {
        organizationId: { type: "integer" },
        userId: { type: "string" },
        locationId: { type: "integer" },
        startDate: { type: "string", format: "date" },
        endDate: { type: "string", format: "date" }
      },
      required: ["organizationId"]
    }
  },
  {
    name: "getAppInfo",
    description: "Get information about BookSmartly app features and routes",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

// Send chat messages to OpenAI and get response
export async function sendChat(messages: ChatCompletionMessageParam[]): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Can be changed to gpt-3.5-turbo-16k for lower cost
      messages,
      functions,
      function_call: "auto",
      temperature: 0.2, // Low temperature for deterministic behavior
      max_tokens: 1000 // Limit token usage
    });
    return response.choices[0].message;
  } catch (error: unknown) {
    // Handle rate limiting with exponential backoff
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      const errorObj = error as { headers?: { "retry-after"?: string } };
      const retryAfter = errorObj.headers?.["retry-after"] ? parseInt(errorObj.headers["retry-after"]) : 1;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return sendChat(messages); // Retry the request
    }
    console.error("OpenAI API error:", error);
    throw error;
  }
}

// Handle function calls from the assistant
export async function handleFunctionCall(message: OpenAI.Chat.Completions.ChatCompletionMessage): Promise<{ name: string; result: unknown }> {
  if (!message.function_call) {
    throw new Error("No function call in message");
  }
  
  const { name, arguments: argsString } = message.function_call;
  const args = JSON.parse(argsString);
  
  try {
    switch (name) {
      case "createAppointment": {
        const appt = await appointmentsApi.createAppointment(args);
        return { name, result: appt };
      }
      case "cancelAppointment": {
        await appointmentsApi.deleteAppointment(args.id, args.userId);
        return { name, result: { success: true, message: "Appointment successfully cancelled" } };
      }
      case "rescheduleAppointment": {
        const moved = await appointmentsApi.updateAppointment(
          args.id,
          { startTime: args.newStart, endTime: args.newEnd },
          args.userId
        );
        return { name, result: moved };
      }
      case "getFinancialAnalytics": {
        return { name, result: await computeFinancialAnalytics(args) };
      }
      case "getAppInfo": {
        return { name, result: getAppInfo() };
      }
      default:
        throw new Error(`Unknown function ${name}`);
    }
  } catch (error) {
    console.error(`Error executing function ${name}:`, error);
    return {
      name,
      result: {
        error: true,
        message: `Failed to execute ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    };
  }
}

// Compute financial analytics based on appointments
async function computeFinancialAnalytics({
  organizationId,
  userId,
  locationId,
  startDate,
  endDate
}: {
  organizationId: number;
  userId?: string;
  locationId?: number;
  startDate?: string;
  endDate?: string;
}) {
  try {
    // Get appointments based on filters
    let appointments: Schema["appointments"][] = [];
    
    if (organizationId) {
      appointments = await appointmentsApi.getOrganizationAppointments(organizationId);
    } else if (userId) {
      appointments = await appointmentsApi.getAppointments(userId);
    } else if (locationId) {
      // We don't have a direct method for this, so we'll get all appointments and filter
      const orgAppointments = await appointmentsApi.getOrganizationAppointments(1); // Assuming org ID 1 for now
      appointments = orgAppointments.filter(a => a.locationId === locationId);
    }
    
    // Filter by date if provided
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      appointments = appointments.filter(a => {
        const appointmentDate = new Date(a.startTime);
        return appointmentDate >= start && appointmentDate <= end;
      });
    }

    // Group by location
    const byLocation = appointments.reduce((acc, a) => {
      const locId = a.locationId || 0;
      acc[locId] = (acc[locId] || 0) + (a.price || 0);
      return acc;
    }, {} as Record<number, number>);

    // Group by user
    const byUser = appointments.reduce((acc, a) => {
      const uId = a.assignedToUserId || 'unassigned';
      acc[uId] = (acc[uId] || 0) + (a.price || 0);
      return acc;
    }, {} as Record<string, number>);

    // Calculate total revenue
    const totalRevenue = appointments.reduce((sum, a) => sum + (a.price || 0), 0);

    // Get location and user names for better readability
    const locationIds = Object.keys(byLocation).map(Number).filter(id => id !== 0);
    const userIds = Object.keys(byUser).filter(id => id !== 'unassigned');
    
    let locations: Schema["locations"][] = [];
    let users: Schema["users"][] = [];
    
    if (locationIds.length > 0) {
      locations = await fine.table("locations")
        .select()
        .in("id", locationIds);
    }
    
    if (userIds.length > 0) {
      users = await fine.table("users")
        .select()
        .in("id", userIds);
    }
      
    // Map IDs to names
    const locationMap = locations.reduce((acc, loc) => {
      if (loc.id !== undefined) {
        acc[loc.id] = loc.name;
      }
      return acc;
    }, {} as Record<number, string>);
    
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user.name || user.email;
      return acc;
    }, {} as Record<string, string>);

    // Format the results with names
    const formattedByLocation = Object.entries(byLocation).map(([locId, revenue]) => ({
      id: Number(locId),
      name: locationMap[Number(locId)] || 'Unknown Location',
      revenue
    }));

    const formattedByUser = Object.entries(byUser).map(([userId, revenue]) => ({
      id: userId,
      name: userId === 'unassigned' ? 'Unassigned' : (userMap[userId] || 'Unknown User'),
      revenue
    }));

    return {
      totalRevenue,
      byLocation: formattedByLocation,
      byUser: formattedByUser,
      period: {
        startDate: startDate || 'all time',
        endDate: endDate || 'present'
      }
    };
  } catch (error) {
    console.error("Error computing financial analytics:", error);
    throw error;
  }
}

// Return information about the app
function getAppInfo() {
  return {
    name: "BookSmartly",
    version: "1.0.0",
    routes: [
      { path: "/", description: "Home page with dashboard overview" },
      { path: "/appointments", description: "View and manage appointments" },
      { path: "/calendar", description: "Calendar view (day/week/month)" },
      { path: "/clients", description: "Client management and import" },
      { path: "/analytics", description: "Financial and appointment analytics" },
      { path: "/admin", description: "Admin settings and user management" },
      { path: "/admin/users", description: "User management" },
      { path: "/admin/settings", description: "Application settings" },
      { path: "/admin/analytics", description: "Advanced analytics for admins" }
    ],
    features: [
      "Calendar views (day/week/month)",
      "Appointment creation, editing, and cancellation",
      "Client management and CSV import",
      "Role-based access control",
      "Financial analytics by organization, user, and location",
      "User management",
      "Organization management"
    ],
    roles: [
      { name: "super_admin", description: "Full access to all features and organizations" },
      { name: "org_admin", description: "Full access to their organization" },
      { name: "user", description: "Limited access based on permissions" }
    ],
    entities: [
      "users", "organizations", "user_roles", "appointments", 
      "appointment_types", "locations", "clients"
    ]
  };
}