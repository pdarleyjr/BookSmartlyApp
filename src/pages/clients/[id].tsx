import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ClientForm } from "@/components/ClientForm";
import { ProtectedRoute } from "@/components/auth/route-components";
import { clientsApi } from "@/api/clients";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { IOSButton } from "@/components/ui/ios-button";
import type { Schema } from "@/lib/db-types";

const ClientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Schema["clients"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const clientId = parseInt(id);
        const data = await clientsApi.getClientById(clientId);

        if (data) {
          setClient(data);
        } else {
          toast({
            title: "Error",
            description: "Client not found.",
            variant: "destructive",
          });
          navigate("/clients");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load client details. Please try again.",
          variant: "destructive",
        });
        navigate("/clients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-center py-8 font-montserrat">Loading client details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <IOSButton 
              variant="ghost" 
              onClick={() => navigate("/clients")}
              className="ios-touch-target flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Clients
            </IOSButton>
          </div>
          
          {client && (
            <ClientForm client={client} isEditing={true} />
          )}
        </div>
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedClientDetails = () => (
  <ProtectedRoute Component={ClientDetailsPage} />
);

export default ProtectedClientDetails;