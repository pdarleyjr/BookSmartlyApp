import { Layout } from "@/components/layout/Layout";
import { AppointmentForm } from "@/components/AppointmentForm";
import { ProtectedRoute } from "@/components/auth/route-components";

const CreateAppointmentPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <AppointmentForm />
        </div>
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedCreateAppointment = () => (
  <ProtectedRoute Component={CreateAppointmentPage} />
);

export default ProtectedCreateAppointment;