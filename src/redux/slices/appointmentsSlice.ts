import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { appointmentsApi, CreateAppointmentDto, UpdateAppointmentDto } from '@/api/appointments';
import type { Schema } from '@/lib/db-types';

interface AppointmentsState {
  items: Schema['appointments'][];
  selectedDate: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AppointmentsState = {
  items: [],
  selectedDate: new Date().toISOString(),
  status: 'idle',
  error: null,
};

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await appointmentsApi.getAppointments(userId);
    } catch (error: any) {
      console.error("Error in fetchAppointments:", error);
      return rejectWithValue(error.message || "Failed to fetch appointments");
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async ({ id, userId }: { id: number, userId: string }, { rejectWithValue }) => {
    try {
      return await appointmentsApi.getAppointmentById(id, userId);
    } catch (error: any) {
      console.error(`Error in fetchAppointmentById for id ${id}:`, error);
      return rejectWithValue(error.message || "Failed to fetch appointment");
    }
  }
);

export const addAppointment = createAsyncThunk(
  'appointments/addAppointment',
  async (appointment: CreateAppointmentDto, { rejectWithValue }) => {
    try {
      return await appointmentsApi.createAppointment(appointment);
    } catch (error: any) {
      console.error("Error in addAppointment:", error);
      return rejectWithValue(error.message || "Failed to create appointment");
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, appointment, userId }: { 
    id: number, 
    appointment: UpdateAppointmentDto,
    userId: string 
  }, { rejectWithValue }) => {
    try {
      const updatedAppointment = await appointmentsApi.updateAppointment(id, appointment, userId);
      return { id, updatedAppointment };
    } catch (error: any) {
      console.error(`Error in updateAppointment for id ${id}:`, error);
      return rejectWithValue(error.message || "Failed to update appointment");
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async ({ id, userId }: { id: number, userId: string }, { rejectWithValue }) => {
    try {
      await appointmentsApi.deleteAppointment(id, userId);
      return id;
    } catch (error: any) {
      console.error(`Error in deleteAppointment for id ${id}:`, error);
      return rejectWithValue(error.message || "Failed to delete appointment");
    }
  }
);

export const fetchAppointmentsByDateRange = createAsyncThunk(
  'appointments/fetchAppointmentsByDateRange',
  async ({ userId, startDate, endDate }: { 
    userId: string, 
    startDate: string, 
    endDate: string 
  }, { rejectWithValue }) => {
    try {
      // Add a small delay to prevent rapid consecutive requests
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const appointments = await appointmentsApi.getAppointmentsByDateRange(userId, startDate, endDate);
      return appointments || [];
    } catch (error: any) {
      console.error("Error in fetchAppointmentsByDateRange:", error);
      // Return an empty array instead of rejecting to prevent UI errors
      return [];
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    clearAppointmentsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch appointments';
      })
      
      // Fetch appointments by date range
      .addCase(fetchAppointmentsByDateRange.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAppointmentsByDateRange.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // This doesn't replace all appointments, just adds any that aren't already in the state
        if (action.payload && action.payload.length > 0) {
          const existingIds = new Set(state.items.map(item => item.id));
          const newAppointments = action.payload.filter(item => item && item.id && !existingIds.has(item.id));
          state.items = [...state.items, ...newAppointments];
        }
        state.error = null;
      })
      .addCase(fetchAppointmentsByDateRange.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch appointments by date range';
      })
      
      // Add appointment
      .addCase(addAppointment.pending, (state) => {
        state.error = null;
      })
      .addCase(addAppointment.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
        state.error = null;
      })
      .addCase(addAppointment.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add appointment';
      })
      
      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        if (action.payload && action.payload.updatedAppointment) {
          const { id, updatedAppointment } = action.payload;
          const index = state.items.findIndex(item => item.id === id);
          if (index !== -1) {
            state.items[index] = updatedAppointment;
          }
        }
        state.error = null;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update appointment';
      })
      
      // Delete appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        if (action.payload) {
          const id = action.payload;
          state.items = state.items.filter(item => item.id !== id);
        }
        state.error = null;
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete appointment';
      });
  },
});

export const { setSelectedDate, clearAppointmentsError } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;