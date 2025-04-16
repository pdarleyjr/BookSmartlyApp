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
    <header className="sticky top-0 z-50 w-full border-b border-discord-backgroundModifierAccent glass-card-dark backdrop-blur-lg h-16 shadow-discord">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 active:scale-95 transition-transform">
            <div className="w-8 h-8 rounded-full bg-gradient-blurple flex items-center justify-center shadow-inner-glow">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-poppins font-bold bg-gradient-blurple bg-clip-text text-transparent">BookSmartly</h1>
          </Link>
        </div>
        
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="ios-touch-target flex items-center justify-center bg-discord-backgroundModifierHover rounded-full p-2 active:scale-95 transition-transform">
                <Menu className="h-6 w-6 text-discord-textNormal" />
                <span className="sr-only">Toggle menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px] glass-card-dark border-l border-discord-backgroundModifierAccent">
              <nav className="flex flex-col gap-6 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-lg font-poppins font-medium transition-colors hover:text-discord-blurple active:scale-95 transition-transform flex items-center gap-2 p-2 rounded-lg hover:bg-discord-backgroundModifierHover"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label === "Dashboard" && <div className="w-8 h-8 rounded-full bg-gradient-blurple flex items-center justify-center shadow-inner-glow"><Calendar className="h-5 w-5 text-white" /></div>}
                    {item.label === "Calendar" && <div className="w-8 h-8 rounded-full bg-gradient-purple-pink flex items-center justify-center shadow-inner-glow"><Calendar className="h-5 w-5 text-white" /></div>}
                    {item.label}
                  </Link>
                ))}
                {session?.user ? (
                  <Link
                    to="/logout"
                    className="text-lg font-poppins font-medium transition-colors hover:text-discord-blurple active:scale-95 transition-transform flex items-center gap-2 p-2 rounded-lg hover:bg-discord-backgroundModifierHover"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-fuchsia flex items-center justify-center shadow-inner-glow">
                      <X className="h-5 w-5 text-white" />
                    </div>
                    Logout
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="text-lg font-poppins font-medium transition-colors hover:text-discord-blurple active:scale-95 transition-transform flex items-center gap-2 p-2 rounded-lg hover:bg-discord-backgroundModifierHover"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-green flex items-center justify-center shadow-inner-glow">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    Login
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="px-3 py-2 text-sm font-poppins font-medium transition-all hover:bg-discord-backgroundModifierHover rounded-lg active:scale-95 text-discord-textNormal"
              >
                {item.label}
              </Link>
            ))}
            {session?.user ? (
              <IOSButton
                onClick={() => window.location.href = "/logout"}
                variant="outline"
                className="border-discord-backgroundModifierAccent text-discord-textNormal hover:bg-discord-backgroundModifierHover"
              >
                Logout
              </IOSButton>
            ) : (
              <IOSButton
                onClick={() => window.location.href = "/login"}
                className="bg-gradient-blurple text-white shadow-discord"
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