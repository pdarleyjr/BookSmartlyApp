import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Calendar } from "lucide-react";
import { IOSButton } from "@/components/ui/ios-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { fine } from "@/lib/fine";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = fine.auth.useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur h-16">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">BookSmartly</h1>
          </Link>
        </div>
        
        <div className="flex md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="p-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {session?.user ? (
                  <>
                    <Link to="/" onClick={() => setIsOpen(false)}>Dashboard</Link>
                    <Link to="/logout" onClick={() => setIsOpen(false)}>Logout</Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        <nav className="hidden md:flex items-center gap-4">
          {session?.user ? (
            <IOSButton onClick={() => window.location.href = "/logout"} variant="outline">
              Logout
            </IOSButton>
          ) : (
            <IOSButton onClick={() => window.location.href = "/login"}>
              Login
            </IOSButton>
          )}
        </nav>
      </div>
    </header>
  );
}