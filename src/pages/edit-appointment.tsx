import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AppointmentForm } from "@/components/AppointmentForm";
import { ProtectedRoute } from "@/components/auth/route-components";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/redux/hooks";
import { fetchAppointmentById } from "@/redux/slices/appointmentsSlice";
import type { Schema } from "@/lib/db-types";

const EditAppointmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Schema["appointments"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id || !session?.user?.id) return;

      try {
        setIsLoading(true);
        const result = await dispatch(fetchAppointmentById({
          id: parseInt(id),
          userId: session.user.id
        })).unwrap();

        if (result) {
          setAppointment(result);
        } else {
          toast({
            title: "Error",
            description: "Appointment not found or you don't have permission to edit it.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load appointment details. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id, session?.user?.id, navigate, dispatch]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-center py-8 font-montserrat">Loading appointment details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          {appointment && (
            <AppointmentForm appointment={appointment} isEditing={true} />
          )}
        </div>
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedEditAppointment = () => (
  <ProtectedRoute Component={EditAppointmentPage} />
);

export default ProtectedEditAppointment;