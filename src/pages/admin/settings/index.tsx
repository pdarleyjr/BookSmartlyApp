import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminProtectedRoute } from "@/components/auth/admin-route-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Settings, BarChart2 } from "lucide-react";
import { useAdminStatus } from "@/hooks/use-admin";
import { fine } from "@/lib/fine";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin, isOrgAdmin } = useAdminStatus();
  const { data: session } = fine.auth.useSession();

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
      title: "Analytics Widget",
      description: "Configure what gets displayed in the analytics dashboard widget",
      icon: BarChart2,
      color: "bg-blue-500",
      path: "/admin/settings/analytics-widget",
      showFor: ["super_admin", "org_admin"] // Only show for super admins and org admins
    },
    {
      title: "General Settings",
      description: "Configure general application settings",
      icon: Settings,
      color: "bg-muted",
      path: "/admin/settings"
    }
  ];

  // Filter cards based on user role
  const filteredCards = settingsCards.filter(card => {
    if (!card.showFor) return true; // Show by default if no role restriction
    if (card.showFor.includes("super_admin") && (isSuperAdmin || session?.user?.email === 'pdarleyjr@gmail.com')) return true;
    if (card.showFor.includes("org_admin") && isOrgAdmin) return true;
    if (card.showFor.includes("admin") && isAdmin) return true;
    return false;
  });

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
          {filteredCards.map((card, index) => {
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
const SettingsPageWithProtection = () => (
  <AdminProtectedRoute Component={SettingsPage} />
);

export default SettingsPageWithProtection;