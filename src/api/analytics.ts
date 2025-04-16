import { fine } from "@/lib/fine";
import type { Schema } from "@/lib/db-types";

/**
 * Analytics data types
 */
export type AppointmentMetrics = {
  total: number;
  completed: number;
  upcoming: number;
  revenue: number;
  averageDuration: number;
};

export type TimeSeriesData = {
  date: string;
  count: number;
  revenue: number;
};

export type UserAnalytics = {
  userId: string;
  userName: string;
  metrics: AppointmentMetrics;
  appointmentsByType: {
    typeId: number;
    typeName: string;
    count: number;
    revenue: number;
  }[];
  timeSeriesData: TimeSeriesData[];
};

export type LocationAnalytics = {
  locationId: number;
  locationName: string;
  metrics: AppointmentMetrics;
  appointmentsByType: {
    typeId: number;
    typeName: string;
    count: number;
    revenue: number;
  }[];
  timeSeriesData: TimeSeriesData[];
};

export type OrganizationAnalytics = {
  organizationId: number;
  organizationName: string;
  metrics: AppointmentMetrics;
  appointmentsByType: {
    typeId: number;
    typeName: string;
    count: number;
    revenue: number;
  }[];
  appointmentsByLocation: {
    locationId: number;
    locationName: string;
    count: number;
    revenue: number;
  }[];
  appointmentsByUser: {
    userId: string;
    userName: string;
    count: number;
    revenue: number;
  }[];
  timeSeriesData: TimeSeriesData[];
};

// Basic analytics data type from the remote version
export type AnalyticsData = {
  totalAppointments: number;
  appointmentsThisMonth: number;
  appointmentsLastMonth: number;
  averageDuration: number;
  appointmentsByDay: Record<string, number>;
  appointmentsByType: { name: string; count: number }[];
  appointmentsByLocation: { name: string; count: number }[];
};

/**
 * Helper function to calculate appointment metrics
 */
const calculateAppointmentMetrics = (appointments: Schema["appointments"][]): AppointmentMetrics => {
  const now = new Date();
  
  const completed = appointments.filter(apt => new Date(apt.endTime) < now).length;
  const upcoming = appointments.filter(apt => new Date(apt.startTime) > now).length;
  const totalRevenue = appointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
  
  // Calculate average duration in minutes
  const totalDurationMinutes = appointments.reduce((sum, apt) => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60);
  }, 0);
  
  const averageDuration = appointments.length > 0 
    ? totalDurationMinutes / appointments.length 
    : 0;
  
  return {
    total: appointments.length,
    completed,
    upcoming,
    revenue: totalRevenue,
    averageDuration
  };
};

/**
 * Helper function to generate time series data
 */
const generateTimeSeriesData = (
  appointments: Schema["appointments"][], 
  startDate: Date, 
  endDate: Date,
  interval: 'day' | 'week' | 'month' = 'day'
): TimeSeriesData[] => {
  // Create date buckets based on interval
  const buckets: Record<string, { count: number, revenue: number }> = {};
  
  // Initialize buckets
  let current = new Date(startDate); // Using let because we modify this variable in the loop
  while (current <= endDate) {
    let bucketKey: string;
    
    if (interval === 'day') {
      bucketKey = current.toISOString().split('T')[0];
    } else if (interval === 'week') {
      // Get the week start date (Sunday)
      const weekStart = new Date(current);
      weekStart.setDate(current.getDate() - current.getDay());
      bucketKey = weekStart.toISOString().split('T')[0];
    } else { // month
      bucketKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    }
    
    buckets[bucketKey] = { count: 0, revenue: 0 };
    
    // Move to next interval
    if (interval === 'day') {
      current.setDate(current.getDate() + 1);
    } else if (interval === 'week') {
      current.setDate(current.getDate() + 7);
    } else { // month
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  // Fill buckets with appointment data
  appointments.forEach(apt => {
    const aptDate = new Date(apt.startTime);
    let bucketKey: string;
    
    if (interval === 'day') {
      bucketKey = aptDate.toISOString().split('T')[0];
    } else if (interval === 'week') {
      // Get the week start date (Sunday)
      const weekStart = new Date(aptDate);
      weekStart.setDate(aptDate.getDate() - aptDate.getDay());
      bucketKey = weekStart.toISOString().split('T')[0];
    } else { // month
      bucketKey = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (buckets[bucketKey]) {
      buckets[bucketKey].count += 1;
      buckets[bucketKey].revenue += apt.price || 0;
    }
  });
  
  // Convert buckets to array
  return Object.entries(buckets).map(([date, data]) => ({
    date,
    count: data.count,
    revenue: data.revenue
  })).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Analytics API service
 */
export const analyticsApi = {
  /**
   * Get analytics data for a user (simple version)
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
   * Get detailed analytics for a user
   */
  getUserAnalyticsDetailed: async (
    userId: string,
    startDate: Date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days by default
    endDate: Date = new Date(),
    interval: 'day' | 'week' | 'month' = 'day'
  ): Promise<UserAnalytics | null> => {
    try {
      // Get user details
      const users = await fine.table("users")
        .select()
        .eq("id", userId);
      
      if (!users || users.length === 0) {
        return null;
      }
      
      const user = users[0];
      
      // Get all appointments for the user
      const appointments = await fine.table("appointments")
        .select()
        .eq("assignedToUserId", userId);
      
      // Filter appointments by date range
      const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= startDate && aptDate <= endDate;
      });
      
      // Calculate metrics
      const metrics = calculateAppointmentMetrics(filteredAppointments);
      
      // Get appointment types
      const appointmentTypeIds = [...new Set(filteredAppointments
        .map(apt => apt.appointmentTypeId)
        .filter(id => id !== null && id !== undefined))] as number[];
      
      const appointmentTypes = await fine.table("appointment_types")
        .select()
        .in("id", appointmentTypeIds);
      
      // Calculate appointments by type
      const appointmentsByType = appointmentTypes.map(type => {
        const typeAppointments = filteredAppointments.filter(apt => apt.appointmentTypeId === type.id);
        const revenue = typeAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
        
        return {
          typeId: type.id!,
          typeName: type.name,
          count: typeAppointments.length,
          revenue
        };
      }).sort((a, b) => b.count - a.count); // Sort by count descending
      
      // Generate time series data
      const timeSeriesData = generateTimeSeriesData(filteredAppointments, startDate, endDate, interval);
      
      return {
        userId,
        userName: user.name || user.email,
        metrics,
        appointmentsByType,
        timeSeriesData
      };
    } catch (error) {
      console.error(`Error fetching user analytics for ${userId}:`, error);
      return null;
    }
  },
  
  /**
   * Get analytics for an organization (simple version)
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
  },
  
  /**
   * Get detailed analytics for an organization
   */
  getOrganizationAnalyticsDetailed: async (
    organizationId: number | null,
    startDate: Date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days by default
    endDate: Date = new Date(),
    interval: 'day' | 'week' | 'month' = 'day'
  ): Promise<OrganizationAnalytics | null> => {
    try {
      // If organizationId is null, return null
      if (organizationId === null) {
        console.log('organizationId is null, returning null');
        return null;
      }
      
      // Get organization details
      const organizations = await fine.table("organizations")
        .select()
        .eq("id", organizationId);
      
      if (!organizations || organizations.length === 0) {
        return null;
      }
      
      const organization = organizations[0];
      
      // Get users in the organization
      const users = await fine.table("users")
        .select()
        .eq("organizationId", organizationId);
      
      if (!users || users.length === 0) {
        return {
          organizationId,
          organizationName: organization.name,
          metrics: {
            total: 0,
            completed: 0,
            upcoming: 0,
            revenue: 0,
            averageDuration: 0
          },
          appointmentsByType: [],
          appointmentsByLocation: [],
          appointmentsByUser: [],
          timeSeriesData: []
        };
      }
      
      const userIds = users.map(user => user.id);
      
      // Get all appointments for the organization
      const appointments = await fine.table("appointments")
        .select()
        .in("userId", userIds);
      
      // Filter appointments by date range
      const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= startDate && aptDate <= endDate;
      });
      
      // Calculate metrics
      const metrics = calculateAppointmentMetrics(filteredAppointments);
      
      // Get appointment types
      const appointmentTypes = await fine.table("appointment_types")
        .select()
        .eq("organizationId", organizationId);
      
      // Get locations
      const locations = await fine.table("locations")
        .select()
        .eq("organizationId", organizationId);
      
      // Calculate appointments by type
      const appointmentsByType = appointmentTypes.map(type => {
        const typeAppointments = filteredAppointments.filter(apt => apt.appointmentTypeId === type.id);
        const revenue = typeAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
        
        return {
          typeId: type.id!,
          typeName: type.name,
          count: typeAppointments.length,
          revenue
        };
      }).sort((a, b) => b.count - a.count); // Sort by count descending
      
      // Calculate appointments by location
      const appointmentsByLocation = locations.map(location => {
        const locationAppointments = filteredAppointments.filter(apt => apt.locationId === location.id);
        const revenue = locationAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
        
        return {
          locationId: location.id!,
          locationName: location.name,
          count: locationAppointments.length,
          revenue
        };
      }).sort((a, b) => b.count - a.count); // Sort by count descending
      
      // Calculate appointments by user
      const appointmentsByUser = users.map(user => {
        const userAppointments = filteredAppointments.filter(apt => apt.assignedToUserId === user.id);
        const revenue = userAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
        
        return {
          userId: user.id,
          userName: user.name || user.email,
          count: userAppointments.length,
          revenue
        };
      }).sort((a, b) => b.count - a.count); // Sort by count descending
      
      // Generate time series data
      const timeSeriesData = generateTimeSeriesData(filteredAppointments, startDate, endDate, interval);
      
      return {
        organizationId,
        organizationName: organization.name,
        metrics,
        appointmentsByType,
        appointmentsByLocation,
        appointmentsByUser,
        timeSeriesData
      };
    } catch (error) {
      console.error(`Error fetching organization analytics for ${organizationId}:`, error);
      return null;
    }
  },
  
  /**
   * Get analytics for a location
   */
  getLocationAnalytics: async (
    locationId: number,
    startDate: Date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days by default
    endDate: Date = new Date(),
    interval: 'day' | 'week' | 'month' = 'day'
  ): Promise<LocationAnalytics | null> => {
    try {
      // Get location details
      const locations = await fine.table("locations")
        .select()
        .eq("id", locationId);
      
      if (!locations || locations.length === 0) {
        return null;
      }
      
      const location = locations[0];
      
      // Get all appointments for the location
      const appointments = await fine.table("appointments")
        .select()
        .eq("locationId", locationId);
      
      // Filter appointments by date range
      const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= startDate && aptDate <= endDate;
      });
      
      // Calculate metrics
      const metrics = calculateAppointmentMetrics(filteredAppointments);
      
      // Get appointment types
      const appointmentTypeIds = [...new Set(filteredAppointments
        .map(apt => apt.appointmentTypeId)
        .filter(id => id !== null && id !== undefined))] as number[];
      
      const appointmentTypes = await fine.table("appointment_types")
        .select()
        .in("id", appointmentTypeIds);
      
      // Calculate appointments by type
      const appointmentsByType = appointmentTypes.map(type => {
        const typeAppointments = filteredAppointments.filter(apt => apt.appointmentTypeId === type.id);
        const revenue = typeAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
        
        return {
          typeId: type.id!,
          typeName: type.name,
          count: typeAppointments.length,
          revenue
        };
      }).sort((a, b) => b.count - a.count); // Sort by count descending
      
      // Generate time series data
      const timeSeriesData = generateTimeSeriesData(filteredAppointments, startDate, endDate, interval);
      
      return {
        locationId,
        locationName: location.name,
        metrics,
        appointmentsByType,
        timeSeriesData
      };
    } catch (error) {
      console.error(`Error fetching location analytics for ${locationId}:`, error);
      return null;
    }
  }
};