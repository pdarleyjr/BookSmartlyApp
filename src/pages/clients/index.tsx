import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ClientCard } from "@/components/ClientCard";
import { IOSButton } from "@/components/ui/ios-button";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/auth/route-components";
import { clientsApi } from "@/api/clients";
import { useAdminStatus } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Upload, UserCircle } from "lucide-react";
import type { Schema } from "@/lib/db-types";

const ClientsPage = () => {
  const [clients, setClients] = useState<Schema["clients"][]>([]);
  const [filteredClients, setFilteredClients] = useState<Schema["clients"][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isOrgAdmin, organizationId } = useAdminStatus();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const data = await clientsApi.getClients(organizationId);
        setClients(data);
        setFilteredClients(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load clients. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [organizationId]);

  useEffect(() => {
    // Filter clients based on search query
    if (searchQuery.trim() === "") {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(query) || 
        (client.email && client.email.toLowerCase().includes(query)) ||
        (client.phone && client.phone.toLowerCase().includes(query))
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await clientsApi.getClients(organizationId);
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh clients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold font-poppins">Clients</h1>
          
          {(isAdmin || isOrgAdmin) && (
            <div className="flex flex-wrap gap-2">
              <IOSButton
                onClick={() => navigate("/clients/new")}
                className="ios-touch-target"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Client
              </IOSButton>
              <IOSButton
                onClick={() => navigate("/clients/import")}
                variant="outline"
                className="ios-touch-target"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </IOSButton>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 ios-touch-target ios-input"
            />
          </div>
        </div>
        
        {isLoading ? (
          <p className="text-center py-8 font-montserrat">Loading clients...</p>
        ) : filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onDelete={handleRefresh}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-xl bg-muted/30 shadow-sm">
            <UserCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-2 font-poppins">No clients found</h3>
            <p className="text-muted-foreground mb-4 font-montserrat">
              {searchQuery ? "No clients match your search criteria." : "You don't have any clients yet."}
            </p>
            {(isAdmin || isOrgAdmin) && !searchQuery && (
              <IOSButton
                onClick={() => navigate("/clients/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </IOSButton>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

// Wrap with ProtectedRoute to ensure only authenticated users can access
const ProtectedClientsPage = () => (
  <ProtectedRoute Component={ClientsPage} />
);

export default ProtectedClientsPage;