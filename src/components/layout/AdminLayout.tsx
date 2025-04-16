import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAdminStatus } from "@/hooks/use-admin";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Building, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type AdminLayoutProps = {
  children: React.ReactNode;
};

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
};

const SidebarItem = ({ icon: Icon, label, href, active, onClick }: SidebarItemProps) => {
  return (
    <li>
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          if (onClick) onClick();
        }}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted",
          active ? "bg-muted" : ""
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </a>
    </li>
  );
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isSuperAdmin } = useAdminStatus();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Automatically collapse sidebar on mobile
  useState(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-card border-r transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-[70px]",
            isMobile && !sidebarOpen && "hidden"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4">
              {sidebarOpen && <h2 className="text-lg font-semibold">Admin Panel</h2>}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-full p-1 hover:bg-muted"
              >
                {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
              </button>
            </div>
            
            <nav className="flex-1 space-y-1 p-4">
              <ul className="space-y-2">
                <SidebarItem
                  icon={LayoutDashboard}
                  label="Dashboard"
                  href="/admin"
                  active={true}
                  onClick={() => navigate("/admin")}
                />
                <SidebarItem
                  icon={Users}
                  label="Users"
                  href="/admin/users"
                  onClick={() => navigate("/admin")}
                />
                <SidebarItem
                  icon={Calendar}
                  label="Appointments"
                  href="/admin/appointments"
                  onClick={() => navigate("/admin")}
                />
                {isSuperAdmin && (
                  <SidebarItem
                    icon={Building}
                    label="Organizations"
                    href="/admin/organizations"
                    onClick={() => navigate("/admin")}
                  />
                )}
              </ul>
              
              <div className="pt-6 mt-6 border-t">
                <ul className="space-y-2">
                  <SidebarItem
                    icon={Settings}
                    label="Settings"
                    href="/admin/settings"
                    onClick={() => navigate("/admin")}
                  />
                  <SidebarItem
                    icon={LogOut}
                    label="Back to App"
                    href="/"
                    onClick={() => navigate("/")}
                  />
                </ul>
              </div>
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}