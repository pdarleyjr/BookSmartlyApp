import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DashboardSidebar } from "./DashboardSidebar";
import { RightPanel } from "./RightPanel";
import { ChatWindow } from "./ChatWindow";
import { fine } from "@/lib/fine";
import { Menu, X, BarChart2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHeight, setChatHeight] = useState(300);
  const { data: session } = fine.auth.useSession();
  const isMobile = useIsMobile();

  // Automatically collapse sidebar and hide right panel on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
      setSidebarOpen(false);
      setRightPanelVisible(false);
    } else {
      setSidebarCollapsed(false);
      setSidebarOpen(true);
      setRightPanelVisible(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };
  
  const toggleRightPanel = () => {
    setRightPanelVisible(!rightPanelVisible);
    // Force a resize event to help components adjust to the new layout
    window.dispatchEvent(new Event('resize'));
  };
  const toggleChat = () => setChatOpen(!chatOpen);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-discord-alt"></div>
        <div className="absolute inset-0 noise opacity-5"></div>
      </div>
      
      <Header />
      
      {/* Mobile Menu Button */}
      {session?.user && isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-50 bg-gradient-blurple rounded-full p-3 shadow-discord h-12 w-12 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
        </button>
      )}
      
      {/* Mobile Right Panel Toggle */}
      {session?.user && isMobile && (
        <button
          onClick={toggleRightPanel}
          className="fixed top-20 right-4 z-50 bg-gradient-green rounded-full p-3 shadow-discord h-12 w-12 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Toggle analytics"
        >
          <BarChart2 className="h-6 w-6 text-white" />
        </button>
      )}
      
      <div className="flex flex-1 relative z-10">
        {/* Sidebar - Off-canvas on mobile */}
        {session?.user && (
          <div
            className={`
              ${isMobile ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out' : ''}
              ${(isMobile && !sidebarOpen) ? '-translate-x-full' : 'translate-x-0'}
            `}
          >
            <DashboardSidebar
              collapsed={sidebarCollapsed}
              onToggle={toggleSidebar}
            />
          </div>
        )}
        
        {/* Overlay for mobile sidebar */}
        {session?.user && isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Main Content */}
        <main
          className={`
            flex-1 transition-all duration-300 p-4
            ${!isMobile && session?.user && !sidebarCollapsed ? 'md:ml-64' : ''}
            ${!isMobile && session?.user && sidebarCollapsed ? 'md:ml-16' : ''}
            ${!isMobile && session?.user && !rightPanelVisible ? 'md:mr-0' : 'md:mr-0'}
          `}
        >
          <div className="glass-card p-6 rounded-discord-lg shadow-discord-lg h-full">
            {children}
          </div>
        </main>
        
        {/* Right Panel - Hidden by default on mobile */}
        {session?.user && rightPanelVisible && (
          <div
            className={`
              ${isMobile ? 'fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out' : ''}
              ${(isMobile && !rightPanelVisible) ? 'translate-x-full' : 'translate-x-0'}
              transition-all duration-300
            `}
          >
            <RightPanel />
          </div>
        )}
        
        {/* Overlay for mobile right panel */}
        {session?.user && isMobile && rightPanelVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30"
            onClick={toggleRightPanel}
          />
        )}
      </div>
      
      {/* Chat Window */}
      {session?.user && (
        <div className="z-50">
          <ChatWindow
            isOpen={chatOpen}
            onToggle={toggleChat}
            height={isMobile ? 400 : chatHeight}
            onResize={setChatHeight}
          />
        </div>
      )}
      <Footer />
    </div>
  );
}