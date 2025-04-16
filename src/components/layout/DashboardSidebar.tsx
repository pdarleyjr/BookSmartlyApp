import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart2, 
  CreditCard, 
  Settings, 
  Users, 
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fine } from "@/lib/fine";
import { useAdminStatus } from "@/hooks/use-admin";

type SidebarItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
};

const SidebarItem = ({ to, icon: Icon, label, collapsed }: SidebarItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all active:scale-95",
      isActive
        ? "bg-discord-backgroundModifierSelected text-discord-blurple"
        : "hover:bg-discord-backgroundModifierHover text-discord-textNormal",
      collapsed ? "justify-center" : ""
    )}
  >
    {({ isActive }) => (
      <>
        <div className={cn(
          "flex items-center justify-center",
          isActive ? "text-discord-blurple" : "text-discord-textMuted"
        )}>
          <Icon className="h-5 w-5 flex-shrink-0" />
        </div>
        {!collapsed && <span className="font-poppins">{label}</span>}
      </>
    )}
  </NavLink>
);

type DashboardSidebarProps = {
  collapsed: boolean;
  onToggle?: () => void;
};

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  const { isAdmin, isSuperAdmin, isOrgAdmin } = useAdminStatus();
  const { data: session } = fine.auth.useSession();
  
  if (!session?.user) return null;
  
  return (
    <aside className={cn(
      "glass-card-dark border-r border-discord-backgroundModifierAccent h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-all shadow-discord",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <h2 className="text-lg font-bold font-poppins bg-gradient-blurple bg-clip-text text-transparent">BookSmartly</h2>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-full hover:bg-discord-backgroundModifierHover active:scale-95 transition-transform"
          >
            {collapsed ? <ChevronRight className="h-5 w-5 text-discord-textMuted" /> : <ChevronLeft className="h-5 w-5 text-discord-textMuted" />}
          </button>
        </div>
        
        <nav className="space-y-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
          <SidebarItem to="/calendar" icon={Calendar} label="Calendar" collapsed={collapsed} />
          <SidebarItem to="/clients" icon={UserCircle} label="Clients" collapsed={collapsed} />
          
          {/* Only show Analytics link for admin users */}
          {(isAdmin || isSuperAdmin || isOrgAdmin) && (
            <SidebarItem to="/analytics" icon={BarChart2} label="Analytics" collapsed={collapsed} />
          )}
          
          <SidebarItem to="/billing" icon={CreditCard} label="Billing" collapsed={collapsed} />
          
          {/* Admin link for all admin types */}
          {(isAdmin || isSuperAdmin || isOrgAdmin) && (
            <SidebarItem to="/admin" icon={Users} label="Admin" collapsed={collapsed} />
          )}
          
          <div className="pt-4 mt-4 border-t border-discord-backgroundModifierAccent">
            <SidebarItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
            <SidebarItem to="/help" icon={HelpCircle} label="Help & Support" collapsed={collapsed} />
          </div>
        </nav>
      </div>
      
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-discord-backgroundModifierHover backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-gradient-blurple flex items-center justify-center text-white shadow-inner-glow">
              {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-discord-textNormal">{session.user.name || session.user.email}</p>
              <p className="text-xs text-discord-textMuted truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}