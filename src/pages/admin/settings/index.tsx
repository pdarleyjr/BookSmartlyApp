import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Clock, DollarSign, Settings } from "lucide-react";

const SettingsPage = () => {
  const navigate = useNavigate();

  const settingsCards = [
    {
      title: "Appointment Types",
      description: "Manage the types of appointments your organization offers",
      icon: Calendar,
      color: "bg-primary",
      path: "/admin/settings/appointment-types"
    },
    {
      title: "Locations",
      description: "Manage the locations where services are provided",
      icon: MapPin,
      color: "bg-secondary",
      path: "/admin/settings/locations"
    },
    {
      title: "Pricing",
      description: "Configure pricing for different services",
      icon: DollarSign,
      color: "bg-accent",
      path: "/admin/settings/appointment-types"
    },
    {
      title: "General Settings",
      description: "Configure general application settings",
      icon: Settings,
      color: "bg-muted",
      path: "/admin/settings"
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-poppins">Settings</h1>
          <p className="text-muted-foreground font-montserrat mt-2">
            Configure your organization's settings and preferences
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCards.map((card, index) => {
            const Icon = card.icon;
            
            return (
              <Card 
                key={index} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(card.path)}
              >
                <div className={`h-2 w-full ${card.color}`} />
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-poppins">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm font-montserrat">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

// Wrap with AdminProtectedRoute to ensure only admins can access
export default () => (
  <AdminProtectedRoute Component={SettingsPage} />
);