import { fine } from "@/lib/fine";
import type { Schema } from "@/lib/db-types";

export type AnalyticsData = {
  totalAppointments: number;
  appointmentsThisMonth: number;
  appointmentsLastMonth: number;
  averageDuration: number;
  appointmentsByDay: Record<string, number>;
  appointmentsByType: { name: string; count: number }[];
  appointmentsByLocation: { name: string; count: number }[];
};

export const analyticsApi = {
  /**
   * Get analytics data for a user
   * @param userId - The user ID
   * @returns Promise with analytics data
   */
  getUserAnalytics: async (userId: string): Promise<AnalyticsData> => {
    try {
      // Get all appointments for the user
      const appointments = await fine.table("appointments")
        .select()
        .eq("userId", userId);
      
      // Calculate total appointments
      const totalAppointments = appointments.length;
      
      // Calculate appointments this month
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const appointmentsThisMonth = appointments.filter(appointment => {
        try {
          const appointmentDate = new Date(appointment.startTime);
          return appointmentDate.getMonth() === thisMonth && 
                 appointmentDate.getFullYear() === thisYear;
        } catch {
          return false;
        }
      }).length;
      
      // Calculate appointments last month
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      
      const appointmentsLastMonth = appointments.filter(appointment => {
        try {
          const appointmentDate = new Date(appointment.startTime);
          return appointmentDate.getMonth() === lastMonth && 
                 appointmentDate.getFullYear() === lastMonthYear;
        } catch {
          return false;
        }
      }).length;
      
      // Calculate average duration
      let totalDurationMinutes = 0;
      appointments.forEach(appointment => {
        try {
          const startTime = new Date(appointment.startTime);
          const endTime = new Date(appointment.endTime);
          const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          totalDurationMinutes += durationMinutes;
        } catch {
          // Skip invalid dates
        }
      });
      
      const averageDuration = totalAppointments > 0 ? 
        Math.round(totalDurationMinutes / totalAppointments) : 0;
      
      // Calculate appointments by day of week
      const appointmentsByDay: Record<string, number> = {
        'Sunday': 0,
        'Monday': 0,
        'Tuesday': 0,
        'Wednesday': 0,
        'Thursday': 0,
        'Friday': 0,
        'Saturday': 0
      };
      
      appointments.forEach(appointment => {
        try {
          const appointmentDate = new Date(appointment.startTime);
          const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
          appointmentsByDay[dayOfWeek] = (appointmentsByDay[dayOfWeek] || 0) + 1;
        } catch {
          // Skip invalid dates
        }
      });
      
      // Get appointment types data
      let appointmentsByType: { name: string; count: number }[] = [];
      
      try {
        // Get all appointment types used by this user
        const appointmentTypeIds = appointments
          .filter(a => a.appointmentTypeId)
          .map(a => a.appointmentTypeId);
        
        if (appointmentTypeIds.length > 0) {
          const uniqueTypeIds = [...new Set(appointmentTypeIds)];
          
          const types = await fine.table("appointment_types")
            .select()
            .in("id", uniqueTypeIds);
          
          // Count appointments by type
          appointmentsByType = types.map(type => {
            const count = appointments.filter(a => a.appointmentTypeId === type.id).length;
            return { name: type.name, count };
          });
        }
      } catch (error) {
        console.error("Error fetching appointment types:", error);
      }
      
      // Get location data
      let appointmentsByLocation: { name: string; count: number }[] = [];
      
      try {
        // Get all locations used by this user
        const locationIds = appointments
          .filter(a => a.locationId)
          .map(a => a.locationId);
        
        if (locationIds.length > 0) {
          const uniqueLocationIds = [...new Set(locationIds)];
          
          const locations = await fine.table("locations")
            .select()
            .in("id", uniqueLocationIds);
          
          // Count appointments by location
          appointmentsByLocation = locations.map(location => {
            const count = appointments.filter(a => a.locationId === location.id).length;
            return { name: location.name, count };
          });
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
      
      return {
        totalAppointments,
        appointmentsThisMonth,
        appointmentsLastMonth,
        averageDuration,
        appointmentsByDay,
        appointmentsByType,
        appointmentsByLocation
      };
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      return {
        totalAppointments: 0,
        appointmentsThisMonth: 0,
        appointmentsLastMonth: 0,
        averageDuration: 0,
        appointmentsByDay: {},
        appointmentsByType: [],
        appointmentsByLocation: []
      };
    }
  },
  
  /**
   * Get analytics data for an organization
   * @param organizationId - The organization ID
   * @returns Promise with analytics data
   */
  getOrganizationAnalytics: async (organizationId: number): Promise<AnalyticsData & {
    totalUsers: number;
    activeUsers: number;
  }> => {
    try {
      // Get all users in the organization
      const users = await fine.table("users")
        .select()
        .eq("organizationId", organizationId);
      
      const userIds = users.map(user => user.id);
      
      // Get all appointments for these users
      const appointments = await fine.table("appointments")
        .select()
        .in("userId", userIds);
      
      // Calculate total appointments
      const totalAppointments = appointments.length;
      
      // Calculate appointments this month
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const appointmentsThisMonth = appointments.filter(appointment => {
        try {
          const appointmentDate = new Date(appointment.startTime);
          return appointmentDate.getMonth() === thisMonth && 
                 appointmentDate.getFullYear() === thisYear;
        } catch {
          return false;
        }
      }).length;
      
      // Calculate appointments last month
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      
      const appointmentsLastMonth = appointments.filter(appointment => {
        try {
          const appointmentDate = new Date(appointment.startTime);
          return appointmentDate.getMonth() === lastMonth && 
                 appointmentDate.getFullYear() === lastMonthYear;
        } catch {
          return false;
        }
      }).length;
      
      // Calculate average duration
      let totalDurationMinutes = 0;
      appointments.forEach(appointment => {
        try {
          const startTime = new Date(appointment.startTime);
          const endTime = new Date(appointment.endTime);
          const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          totalDurationMinutes += durationMinutes;
        } catch {
          // Skip invalid dates
        }
      });
      
      const averageDuration = totalAppointments > 0 ? 
        Math.round(totalDurationMinutes / totalAppointments) : 0;
      
      // Calculate appointments by day of week
      const appointmentsByDay: Record<string, number> = {
        'Sunday': 0,
        'Monday': 0,
        'Tuesday': 0,
        'Wednesday': 0,
        'Thursday': 0,
        'Friday': 0,
        'Saturday': 0
      };
      
      appointments.forEach(appointment => {
        try {
          const appointmentDate = new Date(appointment.startTime);
          const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
          appointmentsByDay[dayOfWeek] = (appointmentsByDay[dayOfWeek] || 0) + 1;
        } catch {
          // Skip invalid dates
        }
      });
      
      // Get appointment types data
      let appointmentsByType: { name: string; count: number }[] = [];
      
      try {
        // Get all appointment types used in this organization
        const appointmentTypeIds = appointments
          .filter(a => a.appointmentTypeId)
          .map(a => a.appointmentTypeId);
        
        if (appointmentTypeIds.length > 0) {
          const uniqueTypeIds = [...new Set(appointmentTypeIds)];
          
          const types = await fine.table("appointment_types")
            .select()
            .in("id", uniqueTypeIds);
          
          // Count appointments by type
          appointmentsByType = types.map(type => {
            const count = appointments.filter(a => a.appointmentTypeId === type.id).length;
            return { name: type.name, count };
          });
        }
      } catch (error) {
        console.error("Error fetching appointment types:", error);
      }
      
      // Get location data
      let appointmentsByLocation: { name: string; count: number }[] = [];
      
      try {
        // Get all locations used in this organization
        const locationIds = appointments
          .filter(a => a.locationId)
          .map(a => a.locationId);
        
        if (locationIds.length > 0) {
          const uniqueLocationIds = [...new Set(locationIds)];
          
          const locations = await fine.table("locations")
            .select()
            .in("id", uniqueLocationIds);
          
          // Count appointments by location
          appointmentsByLocation = locations.map(location => {
            const count = appointments.filter(a => a.locationId === location.id).length;
            return { name: location.name, count };
          });
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
      
      // Calculate active users (users with at least one appointment in the last month)
      const activeUserIds = new Set();
      appointments.forEach(appointment => {
        try {
          const appointmentDate = new Date(appointment.startTime);
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          
          if (appointmentDate >= oneMonthAgo) {
            activeUserIds.add(appointment.userId);
          }
        } catch {
          // Skip invalid dates
        }
      });
      
      return {
        totalAppointments,
        appointmentsThisMonth,
        appointmentsLastMonth,
        averageDuration,
        appointmentsByDay,
        appointmentsByType,
        appointmentsByLocation,
        totalUsers: users.length,
        activeUsers: activeUserIds.size
      };
    } catch (error) {
      console.error("Error fetching organization analytics data:", error);
      return {
        totalAppointments: 0,
        appointmentsThisMonth: 0,
        appointmentsLastMonth: 0,
        averageDuration: 0,
        appointmentsByDay: {},
        appointmentsByType: [],
        appointmentsByLocation: [],
        totalUsers: 0,
        activeUsers: 0
      };
    }
  }
};