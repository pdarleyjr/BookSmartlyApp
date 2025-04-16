import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Calendar } from "lucide-react";
import { IOSButton } from "@/components/ui/ios-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { fine } from "@/lib/fine";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: session } = fine.auth.useSession();

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Calendar", href: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur h-16">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-coral" />
            <h1 className="text-xl font-poppins font-bold">BookSmartly</h1>
          </Link>
        </div>
        
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="ios-touch-target flex items-center justify-center">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-6 mt-8">
                {navItems.map((item) => (
                  <Link 
                    key={item.label}
                    to={item.href} 
                    className="text-lg font-poppins font-medium transition-colors hover:text-coral"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {session?.user ? (
                  <Link 
                    to="/logout" 
                    className="text-lg font-poppins font-medium transition-colors hover:text-coral"
                    onClick={() => setIsOpen(false)}
                  >
                    Logout
                  </Link>
                ) : (
                  <Link 
                    to="/login" 
                    className="text-lg font-poppins font-medium transition-colors hover:text-coral"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.label}
                to={item.href} 
                className="text-sm font-poppins font-medium transition-colors hover:text-coral"
              >
                {item.label}
              </Link>
            ))}
            {session?.user ? (
              <IOSButton 
                onClick={() => window.location.href = "/logout"} 
                variant="outline"
              >
                Logout
              </IOSButton>
            ) : (
              <IOSButton 
                onClick={() => window.location.href = "/login"}
                className="bg-coral text-white hover:bg-coral/90"
              >
                Login
              </IOSButton>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}