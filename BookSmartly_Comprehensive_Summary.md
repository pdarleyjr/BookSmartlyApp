BookSmartly - Comprehensive Technical Overview
Stack Overview

BookSmartly is built with a modern web technology stack optimized for performance, maintainability, and developer experience:

    Frontend Framework: React 18 with TypeScript
    Build Tool: Vite 6
    Styling: Tailwind CSS with custom Discord-inspired theme
    UI Components: shadcn/ui (Radix UI-based components)
    State Management: Redux Toolkit
    Routing: React Router v6
    Form Handling: React Hook Form
    Date Handling: date-fns
    Icons: Lucide React
    Notifications: Sonner toast notifications
    Database: SQLite (via Fine SDK)
    Authentication: Fine SDK authentication

Backend Architecture
Database Schema

The application uses SQLite through the Fine SDK. Here's the complete database schema:

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  organizationId INTEGER,
  organizationApproved BOOLEAN DEFAULT FALSE,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Organizations table
CREATE TABLE organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  accessCode TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User roles table
CREATE TABLE user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('super_admin', 'org_admin', 'user')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Appointments table
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  clientName TEXT,
  appointmentTypeId INTEGER,
  locationId INTEGER,
  assignedToUserId TEXT,
  price REAL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (appointmentTypeId) REFERENCES appointment_types(id),
  FOREIGN KEY (locationId) REFERENCES locations(id),
  FOREIGN KEY (assignedToUserId) REFERENCES users(id)
);

-- Appointment types table
CREATE TABLE appointment_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizationId INTEGER,
  name TEXT NOT NULL,
  durationMinutes INTEGER NOT NULL,
  price REAL NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

-- Locations table
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizationId INTEGER,
  name TEXT NOT NULL,
  address TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

-- Clients table
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizationId INTEGER,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cellPhone TEXT,
  workPhone TEXT,
  fax TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zipCode TEXT,
  country TEXT,
  dateOfBirth TEXT,
  gender TEXT,
  occupation TEXT,
  company TEXT,
  referredBy TEXT,
  emergencyContact TEXT,
  emergencyPhone TEXT,
  insuranceProvider TEXT,
  insuranceId TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

API Services

The application uses a service-based architecture with dedicated API modules for each entity:
Appointments API (src/api/appointments.ts)

export const appointmentsApi = {
  getAppointments: async (userId: string): Promise<Schema["appointments"][]> => {
    // Fetches all appointments for a user
  },
  getAppointmentById: async (id: number, userId: string): Promise<Schema["appointments"] | null> => {
    // Fetches a single appointment by ID
  },
  createAppointment: async (appointment: CreateAppointmentDto): Promise<Schema["appointments"]> => {
    // Creates a new appointment
  },
  updateAppointment: async (id: number, appointment: UpdateAppointmentDto, userId: string): Promise<Schema["appointments"]> => {
    // Updates an existing appointment
  },
  deleteAppointment: async (id: number, userId: string): Promise<void> => {
    // Deletes an appointment
  },
  getAppointmentsByDateRange: async (userId: string, startDate: string, endDate: string): Promise<Schema["appointments"][]> => {
    // Fetches appointments within a date range
  },
  getAppointmentsByStaffMember: async (assignedToUserId: string): Promise<Schema["appointments"][]> => {
    // Fetches appointments for a specific staff member
  }
};

Clients API (src/api/clients.ts)

export const clientsApi = {
  getClients: async (organizationId?: number | null): Promise<Schema["clients"][]> => {
    // Fetches all clients for an organization
  },
  getClientById: async (id: number): Promise<Schema["clients"] | null> => {
    // Fetches a single client by ID
  },
  createClient: async (client: CreateClientDto): Promise<Schema["clients"]> => {
    // Creates a new client
  },
  updateClient: async (id: number, client: UpdateClientDto): Promise<Schema["clients"]> => {
    // Updates an existing client
  },
  deleteClient: async (id: number): Promise<void> => {
    // Deletes a client
  },
  importClientsFromCsv: async (file: File, organizationId?: number | null): Promise<{
    successful: Schema["clients"][];
    failed: { row: number; data: any; error: string }[];
  }> => {
    // Imports clients from a CSV file
  }
};

Admin API (src/api/admin.ts)

export const adminApi = {
  checkAdminStatus: async (userId: string): Promise<{ 
    isAdmin: boolean; 
    isSuperAdmin: boolean;
    isOrgAdmin: boolean;
    role: Schema["user_roles"]["role"] | null;
    organizationId: number | null;
  }> => {
    // Checks if a user has admin privileges
  },
  getAllUsers: async (): Promise<UserWithRole[]> => {
    // Gets all users (for super admin)
  },
  getOrganizationUsers: async (organizationId: number): Promise<UserWithRole[]> => {
    // Gets users in an organization (for org admin)
  },
  getAllAppointments: async (): Promise<(Schema["appointments"] & { userName?: string })[]> => {
    // Gets all appointments (for super admin)
  },
  getOrganizationAppointments: async (organizationId: number): Promise<(Schema["appointments"] & { userName?: string })[]> => {
    // Gets appointments for an organization (for org admin)
  },
  updateUserRole: async (userId: string, role: Schema["user_roles"]["role"]): Promise<boolean> => {
    // Updates a user's role
  },
  updateUserOrganization: async (userId: string, organizationId: number | null, approved: boolean = false): Promise<boolean> => {
    // Updates a user's organization
  },
  approveUserOrganization: async (userId: string): Promise<boolean> => {
    // Approves a user's organization access
  }
};

Frontend Architecture
State Management

The application uses Redux Toolkit for state management. Here's the appointments slice:

// src/redux/slices/appointmentsSlice.ts
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
      // Additional cases for other async thunks
  },
});

Routing

The application uses React Router v6 for routing. Here's the main router configuration:

// src/App.tsx
<Router>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<LoginForm />} />
    <Route path="/signup" element={<SignupForm />} />
    <Route path="/logout" element={<Logout />} />
    <Route path="/create-appointment" element={<CreateAppointment />} />
    <Route path="/edit-appointment/:id" element={<EditAppointment />} />
    <Route path="/appointment/:id" element={<AppointmentDetails />} />
    <Route path="/analytics" element={<UserAnalyticsDashboard />} />
    
    {/* Clients routes */}
    <Route path="/clients" element={<ClientsPage />} />
    <Route path="/clients/:id" element={<ClientDetails />} />
    <Route path="/clients/new" element={<CreateClient />} />
    <Route path="/clients/import" element={<ImportClients />} />
    
    {/* Admin routes */}
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/appointments/:id" element={<AdminAppointmentDetails />} />
    <Route path="/admin/users/:id" element={<AdminUserManagement />} />
    <Route path="/admin/organizations/:id" element={<AdminOrganizationManagement />} />
    <Route path="/admin/organizations/new" element={<CreateOrganization />} />
    <Route path="/admin/settings" element={<AdminSettings />} />
    <Route path="/admin/settings/appointment-types" element={<AdminAppointmentTypes />} />
    <Route path="/admin/settings/locations" element={<AdminLocations />} />
    <Route path="/admin/analytics" element={<AdminAnalytics />} />
    <Route path="/admin/analytics/users/:id" element={<AdminUserAnalytics />} />
    <Route path="/admin/analytics/locations/:id" element={<AdminLocationAnalytics />} />
  </Routes>
</Router>

Protected Routes

The application uses protected routes to ensure that only authenticated users can access certain pages:

// src/components/auth/route-components.tsx
export const ProtectedRoute = ({ Component }: { Component: () => JSX.Element }) => {
  const { data: session, isPending } = fine.auth.useSession();

  if (isPending) return <div>Loading...</div>;
  
  if (!session?.user) {
    return <Navigate to='/login' />;
  }
  
  return <Component />;
};

For admin routes, there's a specialized component:

// src/components/auth/admin-route-components.tsx
export const AdminProtectedRoute = ({ 
  Component,
  requireSuperAdmin = false
}: { 
  Component: () => JSX.Element;
  requireSuperAdmin?: boolean;
}) => {
  const { data: session, isPending } = fine.auth.useSession();
  const { isAdmin, isSuperAdmin, isLoading } = useAdminStatus();

  if (isPending || isLoading) return <div>Loading...</div>;
  
  if (!session?.user) {
    return <Navigate to='/login' />;
  }
  
  // Special case for pdarleyjr@gmail.com - always allow access
  if (session.user.email === 'pdarleyjr@gmail.com') {
    return <Component />;
  }
  
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to='/' />;
  }
  
  if (!isAdmin) {
    return <Navigate to='/' />;
  }
  
  return <Component />;
};

Calendar and Appointment Scheduling
Calendar Component

The calendar component (src/components/CalendarView.tsx) is a versatile component that supports three view modes:

    Month View: Traditional calendar grid showing the entire month
    Week View: Shows a week at a time with appointment summaries
    Day View: Detailed view of a single day's appointments

export function CalendarView({
  appointments,
  onDateSelect,
  selectedDate,
  isCompact = false,
  initialView
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>(initialView || "month");
  const isMobile = useIsMobile();
  
  // Switch to day view on mobile by default
  useEffect(() => {
    if (isMobile && !initialView) {
      setViewMode("day");
    }
  }, [isMobile, initialView]);
  
  // Rendering logic for different view modes
  const renderDayView = () => { /* ... */ };
  const renderWeekView = () => { /* ... */ };
  const renderMonthView = () => { /* ... */ };

  return (
    <div className={cn(
      "w-full ios-card p-4",
      isCompact ? "h-auto" : "h-full min-h-[600px]"
    )}>
      {/* View mode selector */}
      <div className="flex rounded-lg overflow-hidden border">
        <button
          onClick={() => setViewMode("day")}
          className={cn(
            "px-4 py-2 text-sm font-medium ios-touch-target active:scale-95 transition-transform min-w-[44px] h-[44px]",
            viewMode === "day" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
          )}
        >
          Day
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={cn(
            "px-4 py-2 text-sm font-medium ios-touch-target active:scale-95 transition-transform min-w-[44px] h-[44px]",
            viewMode === "week" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
          )}
        >
          Week
        </button>
        <button
          onClick={() => setViewMode("month")}
          className={cn(
            "px-4 py-2 text-sm font-medium ios-touch-target active:scale-95 transition-transform min-w-[44px] h-[44px]",
            viewMode === "month" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
          )}
        >
          Month
        </button>
      </div>
      
      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}
    </div>
  );
}

Time Slot Picker

The time slot picker (src/components/TimeSlotPicker.tsx) allows users to select appointment times and durations:

export function TimeSlotPicker({
  date,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onDurationChange,
  appointmentType
}: TimeSlotPickerProps) {
  const [duration, setDuration] = useState("30");
  
  // Generate time slots in 15-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 96; i++) { // 24 hours * 4 (15-minute intervals)
      const time = addMinutes(start, i * 15);
      slots.push({
        value: format(time, "HH:mm"),
        label: format(time, "h:mm a")
      });
    }
    
    return slots;
  };
  
  // Update end time when start time or duration changes
  useEffect(() => {
    if (startTime && !appointmentType) {
      try {
        // Create a date object with the selected date and start time
        const startDateTime = parseISO(startTime);
        const durationMinutes = parseInt(duration, 10);
        
        // Add the duration to get the end time
        const endDateTime = addMinutes(startDateTime, durationMinutes);
        onEndTimeChange(format(endDateTime, "yyyy-MM-dd'T'HH:mm"));
      } catch (e) {
        // Handle parsing errors
      }
    }
  }, [startTime, duration, onEndTimeChange, appointmentType]);
  
  // Render time slot picker UI
  return (
    <div className="space-y-4 font-montserrat">
      {/* Start time selector */}
      {/* Duration selector */}
      {/* End time display */}
    </div>
  );
}

Appointment Form

The appointment form (src/components/AppointmentForm.tsx) handles creating and editing appointments:

export function AppointmentForm({ appointment, isEditing = false }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentTypes, setAppointmentTypes] = useState<Schema["appointment_types"][]>([]);
  const [locations, setLocations] = useState<Schema["locations"][]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<Schema["users"][]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const dispatch = useAppDispatch();
  const { isAdmin, isOrgAdmin, organizationId } = useAdminStatus();
  
  const [formData, setFormData] = useState<Omit<Schema["appointments"], "id" | "userId" | "createdAt" | "updatedAt">>({
    title: "",
    description: "",
    location: "",
    startTime: format(selectedDate, "yyyy-MM-dd'T'10:00"),
    endTime: format(selectedDate, "yyyy-MM-dd'T'10:30"),
    clientName: "",
    appointmentTypeId: undefined,
    locationId: undefined,
    assignedToUserId: undefined,
    price: undefined
  });

  // Load appointment types, locations, and organization users
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load appointment types
        const types = await appointmentTypesApi.getAppointmentTypes(organizationId);
        setAppointmentTypes(types);
        
        // Load locations
        const locs = await locationsApi.getLocations(organizationId);
        setLocations(locs);
        
        // Load organization users if admin
        if ((isOrgAdmin || isAdmin) && organizationId) {
          const users = await adminApi.getOrganizationUsers(organizationId);
          setOrganizationUsers(users);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [organizationId, isOrgAdmin, isAdmin]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create appointments",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // If no title is provided but client name is, use client name as title
      const finalFormData = {
        ...formData,
        title: formData.title || `Appointment for ${formData.clientName}`
      };
      
      if (isEditing && appointment?.id) {
        // Update existing appointment
        await dispatch(updateAppointment({
          id: appointment.id,
          appointment: updateData,
          userId: session.user.id
        })).unwrap();
        
        toast({
          title: "Success",
          description: "Appointment updated successfully",
        });
      } else {
        // Create new appointment
        await dispatch(addAppointment({
          ...finalFormData,
          userId: session.user.id,
        })).unwrap();
        
        toast({
          title: "Success",
          description: "Appointment created successfully",
        });
      }
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render form UI
  return (
    <Card className="ios-card w-full border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-poppins">{isEditing ? "Edit Appointment" : "Create New Appointment"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {/* Form fields */}
        </CardContent>
        
        <CardFooter className="flex justify-between pb-6">
          <IOSButton 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/")}
            disabled={isLoading}
            className="ios-touch-target font-montserrat"
          >
            Cancel
          </IOSButton>
          <IOSButton 
            type="submit" 
            disabled={isLoading}
            className="ios-touch-target bg-coral text-white font-montserrat"
          >
            {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
          </IOSButton>
        </CardFooter>
      </form>
    </Card>
  );
}

Analytics

The analytics are calculated in real-time based on the appointments data. The main analytics are displayed in the right panel (src/components/layout/RightPanel.tsx):

// Calculate analytics data
const totalAppointments = appointments.length;

const currentMonth = new Date();
const startOfCurrentMonth = startOfMonth(currentMonth);
const endOfCurrentMonth = endOfMonth(currentMonth);

const appointmentsThisMonth = appointments.filter(appointment => {
  try {
    const appointmentDate = parseISO(appointment.startTime);
    return appointmentDate >= startOfCurrentMonth && appointmentDate <= endOfCurrentMonth;
  } catch {
    return false;
  }
});

const totalDurationMinutes = appointments.reduce((total, appointment) => {
  try {
    const startTime = parseISO(appointment.startTime);
    const endTime = parseISO(appointment.endTime);
    return total + differenceInMinutes(endTime, startTime);
  } catch {
    return total;
  }
}, 0);

const averageDurationMinutes = totalAppointments > 0 ? Math.round(totalDurationMinutes / totalAppointments) : 0;

These analytics are displayed in the right panel:

<div className="space-y-4">
  <div className="flex items-center">
    <div className="w-10 h-10 rounded-full bg-gradient-blurple flex items-center justify-center mr-3 shadow-inner-glow">
      <Calendar className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-sm text-discord-textMuted">Total Appointments</p>
      <p className="text-lg font-semibold text-discord-textNormal">{totalAppointments}</p>
    </div>
  </div>
  
  <div className="flex items-center">
    <div className="w-10 h-10 rounded-full bg-gradient-blue-cyan flex items-center justify-center mr-3 shadow-inner-glow">
      <Calendar className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-sm text-discord-textMuted">This Month</p>
      <p className="text-lg font-semibold text-discord-textNormal">{appointmentsThisMonth.length}</p>
    </div>
  </div>
  
  <div className="flex items-center">
    <div className="w-10 h-10 rounded-full bg-gradient-cyan-green flex items-center justify-center mr-3 shadow-inner-glow">
      <Clock className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-sm text-discord-textMuted">Avg. Duration</p>
      <p className="text-lg font-semibold text-discord-textNormal">{averageDurationMinutes} min</p>
    </div>
  </div>
</div>

Authentication Configuration

Authentication is handled by the Fine SDK. The application uses the following authentication components:
Login Form

// src/pages/login.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const { data, error } = await fine.auth.signIn.email(
      {
        email: formData.email,
        password: formData.password,
        callbackURL: "/",
        rememberMe: formData.rememberMe,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async (ctx) => {
          // Check if there's pending organization data from signup
          const pendingOrgId = localStorage.getItem("pendingOrgId");
          const pendingOrgCode = localStorage.getItem("pendingOrgCode");
          
          if (pendingOrgId && pendingOrgCode && ctx.data?.user?.id) {
            try {
              // Verify the organization code
              const isValid = await organizationsApi.verifyOrganizationCode(
                parseInt(pendingOrgId),
                pendingOrgCode
              );
              
              if (isValid) {
                // Add user to organization
                await adminApi.updateUserOrganization(ctx.data.user.id, parseInt(pendingOrgId));
                
                toast({
                  title: "Organization joined",
                  description: "You have been added to the organization. An admin will need to approve your request.",
                });
              }
              
              // Clear the pending organization data
              localStorage.removeItem("pendingOrgId");
              localStorage.removeItem("pendingOrgCode");
            } catch (error) {
              console.error("Failed to process organization membership:", error);
            }
          }
          
          toast({
            title: "Success",
            description: "You have been signed in successfully.",
          });
          navigate("/");
        },
        onError: (ctx) => {
          toast({
            title: "Error",
            description: ctx.error.message,
            variant: "destructive",
          });
        },
      }
    );
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Invalid email or password.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

Signup Form

// src/pages/signup.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const isValid = await validateForm();
  if (!isValid) return;

  setIsLoading(true);

  try {
    // Sign up the user
    const { data, error } = await fine.auth.signUp.email(
      {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        callbackURL: "/",
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async () => {
          // After successful signup, handle organization-specific logic
          try {
            // For organization creators or joiners, we'll handle this after they log in
            // since we don't have access to the user ID at this point
            
            if (accountType === "organization") {
              toast({
                title: "Organization setup",
                description: "After logging in, please go to the admin panel to create your organization.",
              });
            } else if (accountType === "orgUser") {
              toast({
                title: "Organization membership",
                description: "After logging in, please go to your profile to join the organization.",
              });
              
              // Store organization info in localStorage for later use
              localStorage.setItem("pendingOrgId", formData.organizationId);
              localStorage.setItem("pendingOrgCode", formData.organizationCode);
            }
            
            toast({
              title: "Account created",
              description: "Your account has been created successfully. Please log in.",
            });
            
            navigate("/login");
          } catch (orgError) {
            console.error("Failed to handle organization setup:", orgError);
            toast({
              title: "Account created",
              description: "Your account was created, but there was an issue with organization setup.",
            });
            navigate("/login");
          }
        },
        onError: (ctx) => {
          toast({
            title: "Error",
            description: ctx.error.message,
            variant: "destructive",
          });
          setIsLoading(false);
        },
      }
    );

    if (error) {
      throw error;
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Something went wrong. Please try again.",
      variant: "destructive",
    });
    setIsLoading(false);
  }
};

Logout

// src/pages/logout.tsx
useEffect(() => {
  const logoutUser = async () => {
    try {
      await fine.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      navigate("/");
    }
  };

  logoutUser();
}, [navigate]);

Client Management and CSV Import

The application includes a comprehensive client management system with CSV import functionality:

// src/api/clients.ts
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
              // Only require name field, everything else is optional
              if (!row.name) {
                failed.push({ row: i + 1, data: row, error: "Name is required" });
                continue;
              }
              
              // Create client object with whatever fields are available
              const clientData: CreateClientDto = {
                name: row.name,
                organizationId,
                // Map any available fields from the CSV
                email: row.email || null,
                phone: row.phone || row.phoneNumber || row.contact || null,
                cellPhone: row.cellPhone || row.mobilePhone || row.mobile || row.cell || null,
                workPhone: row.workPhone || row.businessPhone || row.officePhone || null,
                fax: row.fax || row.faxNumber || null,
                address: row.address || row.location || row.streetAddress || null,
                city: row.city || null,
                state: row.state || row.province || row.region || null,
                zipCode: row.zipCode || row.postalCode || row.zip || null,
                country: row.country || null,
                dateOfBirth: row.dateOfBirth || row.dob || row.birthdate || row.birthday || null,
                gender: row.gender || row.sex || null,
                occupation: row.occupation || row.job || row.profession || null,
                company: row.company || row.organization || row.employer || null,
                referredBy: row.referredBy || row.referral || row.referralSource || null,
                emergencyContact: row.emergencyContact || row.emergency || null,
                emergencyPhone: row.emergencyPhone || row.emergencyContactPhone || null,
                insuranceProvider: row.insuranceProvider || row.insurance || row.provider || null,
                insuranceId: row.insuranceId || row.policyNumber || row.insuranceNumber || null,
                notes: row.notes || row.comments || row.description || null
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

Organization Management

The application supports multi-organization setup with different user roles:

// src/api/organizations.ts
export const organizationsApi = {
  createOrganization: async (name: string, userId?: string): Promise<Schema["organizations"] & { accessCode: string } | null> => {
    try {
      const accessCode = generateOrgCode();
      
      const now = new Date().toISOString();
      const newOrg = {
        name,
        accessCode,
        createdAt: now,
        updatedAt: now
      };
      
      const orgs = await fine.table("organizations").insert(newOrg).select();
      
      if (orgs && orgs.length > 0 && userId) {
        const createdOrg = orgs[0];
        
        // Assign the creating user to this organization
        await fine.table("users")
          .update({
            organizationId: createdOrg.id,
            updatedAt: now
          })
          .eq("id", userId);
        
        // Make the creating user an org admin
        try {
          // Check if user already has a role
          const existingRoles = await fine.table("user_roles")
            .select()
            .eq("userId", userId);
          
          if (existingRoles && existingRoles.length > 0) {
            // Update existing role
            await fine.table("user_roles")
              .update({
                role: 'org_admin',
                updatedAt: now
              })
              .eq("userId", userId);
          } else {
            // Create new role
            await fine.table("user_roles").insert({
              userId,
              role: 'org_admin',
              createdAt: now,
              updatedAt: now
            });
          }
        } catch (error) {
          console.error("Error setting user as org admin:", error);
          // Continue anyway, the organization was created
        }
      }
      
      return orgs && orgs.length > 0 ? orgs[0] : null;
    } catch (error) {
      console.error(`Error creating organization ${name}:`, error);
      return null;
    }
  },

  verifyOrganizationCode: async (organizationId: number, accessCode: string): Promise<boolean> => {
    try {
      const orgs = await fine.table("organizations")
        .select()
        .eq("id", organizationId)
        .eq("accessCode", accessCode);
      
      return orgs && orgs.length > 0;
    } catch (error) {
      console.error(`Error verifying organization code:`, error);
      return false;
    }
  },

  regenerateAccessCode: async (organizationId: number): Promise<string | null> => {
    try {
      const accessCode = generateOrgCode();
      
      await fine.table("organizations")
        .update({ 
          accessCode,
          updatedAt: new Date().toISOString()
        })
        .eq("id", organizationId);
      
      return accessCode;
    } catch (error) {
      console.error(`Error regenerating access code:`, error);
      return null;
    }
  }
};

Mobile Responsiveness

The application is fully responsive with mobile-specific optimizations:

// src/hooks/use-mobile.tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
}

Mobile-specific UI elements:

// src/pages/index.tsx
{/* Mobile Floating Action Button */}
{isMobile && (
  <div className="fixed bottom-20 right-4 z-40">
    <IOSButton
      onClick={() => navigate("/create-appointment")}
      size="icon"
      className="rounded-full shadow-lg"
    >
      <Plus className="h-6 w-6" />
    </IOSButton>
  </div>
)}

{/* Mobile Bottom Navigation */}
{isMobile && (
  <div className="fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around items-center p-2 z-30">
    <button className="flex flex-col items-center justify-center p-2 rounded-lg active:scale-95 transition-transform min-w-[64px]">
      <CalendarIcon className="h-6 w-6 text-primary mb-1" />
      <span className="text-xs">Calendar</span>
    </button>
    <button className="flex flex-col items-center justify-center p-2 rounded-lg active:scale-95 transition-transform min-w-[64px]">
      <Clock className="h-6 w-6 text-muted-foreground mb-1" />
      <span className="text-xs text-muted-foreground">Schedule</span>
    </button>
    <button className="flex flex-col items-center justify-center p-2 rounded-lg active:scale-95 transition-transform min-w-[64px]">
      <User className="h-6 w-6 text-muted-foreground mb-1" />
      <span className="text-xs text-muted-foreground">Profile</span>
    </button>
  </div>
)}

Pages and Routes

Here's a comprehensive list of all pages and their routes:

    Main Pages
        / - Dashboard/Calendar view
        /create-appointment - Create new appointment
        /edit-appointment/:id - Edit existing appointment
        /appointment/:id - View appointment details
        /analytics - User analytics dashboard

    Authentication Pages
        /login - User login
        /signup - User registration
        /logout - User logout

    Client Management Pages
        /clients - List all clients
        /clients/:id - View/edit client details
        /clients/new - Create new client
        /clients/import - Import clients from CSV

    Admin Pages
        /admin - Admin dashboard
        /admin/appointments/:id - Admin view of appointment details
        /admin/users/:id - User management
        /admin/organizations/:id - Organization management
        /admin/organizations/new - Create new organization
        /admin/settings - Admin settings
        /admin/settings/appointment-types - Manage appointment types
        /admin/settings/locations - Manage locations
        /admin/analytics - Admin analytics dashboard
        /admin/analytics/users/:id - User-specific analytics
        /admin/analytics/locations/:id - Location-specific analytics

Styling and Theme

The application uses a custom Discord-inspired theme with Tailwind CSS:

// tailwind.config.js
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // Mobile-first breakpoints
    screens: {
      sm: '480px',    // Small mobile devices
      md: '768px',    // Tablets and larger phones
      lg: '1024px',   // Laptops/desktops
      xl: '1280px',   // Large desktops
      '2xl': '1536px' // Extra large screens
    },
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        // Discord-inspired colors
        discord: {
          blurple: '#5865F2',
          green: '#57F287',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
          red: '#ED4245',
          // Additional Discord colors...
        },
        // Modern gradient colors
        gradient: {
          blue: '#5865F2',
          purple: '#8B5CF6',
          pink: '#EC4899',
          // Additional gradient colors...
        },
        // Glass effect colors
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          // Additional glass effect colors...
        },
        // Updated app colors
        background: '#F9FAFB',
        foreground: '#333333',
        primary: {
          DEFAULT: '#5865F2', // Discord blurple
          foreground: '#FFFFFF'
        },
        // Additional app colors...
      },
      backgroundImage: {
        'gradient-discord': 'linear-gradient(to bottom right, #5865F2, #EB459E)',
        'gradient-discord-alt': 'linear-gradient(to bottom right, #5865F2, #8B5CF6, #EB459E)',
        // Additional gradient backgrounds...
      },
      boxShadow: {
        'discord': '0 8px 16px rgba(0, 0, 0, 0.24)',
        'discord-lg': '0 8px 24px rgba(0, 0, 0, 0.32)',
        // Additional shadow styles...
      },
      borderRadius: {
        'discord': '8px',
        'discord-lg': '16px',
        // Additional border radius styles...
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        // Additional backdrop blur styles...
      },
    }
  },
  plugins: [
    import("tailwindcss-animate"),
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.125)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        // Additional custom utilities...
      }
      addUtilities(newUtilities)
    }
  ],
};

Custom CSS classes for mobile-friendly UI:

/* src/index.css */
.ios-button {
  @apply rounded-full py-3 px-6 font-medium transition-all active:scale-95 shadow-discord;
  min-height: 44px;
}

.ios-card {
  @apply glass-card rounded-discord-lg shadow-glass-lg;
}

.ios-input {
  @apply rounded-lg border border-border bg-discord-chatInputBg px-4 py-3 shadow-inner-glow;
  min-height: 44px;
}

.ios-touch-target {
  min-height: 44px;
  min-width: 44px;
}

Summary

BookSmartly is a comprehensive, mobile-friendly appointment scheduling application with the following key features:

    User Authentication: Complete login, signup, and logout functionality with role-based access control.

    Calendar Management: Interactive calendar with day, week, and month views for easy appointment scheduling.

    Appointment Management: Create, edit, view, and delete appointments with detailed information.

    Client Management: Comprehensive client database with CSV import functionality.

    Organization System: Multi-organization support with different user roles (super admin, org admin, user).

    Analytics: Real-time analytics showing appointment statistics.

    Mobile Optimization: Responsive design with mobile-specific UI elements for optimal user experience on all devices.

    Admin Dashboard: Comprehensive admin interface for managing users, organizations, appointment types, and locations.

The application is built with modern web technologies and follows best practices for performance, security, and user experience. The codebase is well-structured and modular, making it easy to maintain and extend.
