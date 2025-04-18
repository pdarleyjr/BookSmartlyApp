import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-xl font-bold">BookSmartly</h2>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          © {currentYear} BookSmartly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}