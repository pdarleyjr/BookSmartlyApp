import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CsvImportForm } from "@/components/CsvImportForm";
import { ProtectedRoute } from "@/components/auth/route-components";
import { IOSButton } from "@/components/ui/ios-button";
import { ArrowLeft } from "lucide-react";

const ImportClientsPage = () => {
  const navigate = useNavigate();

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
          
          <CsvImportForm />
        </div>
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedImportClients = () => (
  <ProtectedRoute Component={ImportClientsPage} />
);

export default ProtectedImportClients;