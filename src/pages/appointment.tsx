import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AppointmentForm } from "@/components/AppointmentForm";
import { ProtectedRoute } from "@/components/auth/route-components";

const AppointmentPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <AppointmentForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedAppointment = () => (
  <ProtectedRoute Component={AppointmentPage} />
);

export default ProtectedAppointment;