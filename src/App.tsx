import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

// Pages
import Index from "@/pages/index";
import LoginForm from "@/pages/login";
import SignupForm from "@/pages/signup";
import Logout from "@/pages/logout";
import CreateAppointment from "@/pages/create-appointment";
import EditAppointment from "@/pages/edit-appointment";
import AppointmentDetails from "@/pages/appointment-details";
import CalendarPage from "@/pages/calendar";
import UserAnalyticsDashboard from "@/pages/analytics";
import BillingPage from "@/pages/billing";
import ChatPage from "@/pages/chat";
import AdminDashboard from "@/pages/admin/index";
import AdminAppointmentDetails from "@/pages/admin/appointments/[id]";
import AdminUserManagement from "@/pages/admin/users/[id]";
import AdminOrganizationManagement from "@/pages/admin/organizations/[id]";
import CreateOrganization from "@/pages/admin/organizations/new";
import StaffManagement from "@/pages/admin/staff";
import AdminSettings from "@/pages/admin/settings/index";
import AdminAppointmentTypes from "@/pages/admin/settings/appointment-types";
import AdminLocations from "@/pages/admin/settings/locations";
import AdminAnalytics from "@/pages/admin/analytics/index";
import AdminUserAnalytics from "@/pages/admin/analytics/users/[id]";
import AdminLocationAnalytics from "@/pages/admin/analytics/locations/[id]";
import ClientsPage from "@/pages/clients/index";
import ClientDetails from "@/pages/clients/[id]";
import CreateClient from "@/pages/clients/new";
import ImportClients from "@/pages/clients/import";

function App() {
  return (
    <Provider store={store}>
      <TooltipProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/create-appointment" element={<CreateAppointment />} />
              <Route path="/edit-appointment/:id" element={<EditAppointment />} />
              <Route path="/appointment/:id" element={<AppointmentDetails />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/analytics" element={<UserAnalyticsDashboard />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/users/:id" element={<AdminUserManagement />} />
              <Route path="/settings/appointment-types" element={<AdminAppointmentTypes />} />
              <Route path="/settings/locations" element={<AdminLocations />} />
              <Route path="/settings" element={<AdminSettings />} />
              
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
              <Route path="/admin/staff" element={<StaffManagement />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/settings/appointment-types" element={<AdminAppointmentTypes />} />
              <Route path="/admin/settings/locations" element={<AdminLocations />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/analytics/users/:id" element={<AdminUserAnalytics />} />
              <Route path="/admin/analytics/locations/:id" element={<AdminLocationAnalytics />} />
            </Routes>
          </Router>
          <Sonner />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </Provider>
  );
}

export default App;