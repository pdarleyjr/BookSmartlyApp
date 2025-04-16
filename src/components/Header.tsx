import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Camera } from "lucide-react";
import { IOSButton } from "@/components/ui/ios-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur h-16">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-pastel-sky" />
            <h1 className="text-xl font-poppins font-bold">PhotoFolio</h1>
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
                    className="text-lg font-poppins font-medium transition-colors hover:text-pastel-sky"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.label}
                to={item.href} 
                className="text-sm font-poppins font-medium transition-colors hover:text-pastel-sky"
              >
                {item.label}
              </Link>
            ))}
            <IOSButton className="bg-pastel-sky text-black hover:bg-pastel-sky/90">
              Book a Session
            </IOSButton>
          </nav>
        )}
      </div>
    </header>
  );
}