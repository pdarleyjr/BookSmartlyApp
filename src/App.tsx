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