import { Calendar, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-6 w-6 text-coral" />
              <h2 className="text-xl font-poppins font-bold">BookSmartly</h2>
            </div>
            <p className="text-muted-foreground mb-4 font-montserrat">
              Simplify your scheduling with our intuitive appointment management app.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-poppins">Quick Links</h3>
            <ul className="space-y-2 font-montserrat">
              <li><Link to="/" className="hover:text-coral">Home</Link></li>
              <li><Link to="/create-appointment" className="hover:text-coral">New Appointment</Link></li>
              <li><Link to="/login" className="hover:text-coral">Login</Link></li>
              <li><Link to="/signup" className="hover:text-coral">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-poppins">Contact</h3>
            <ul className="space-y-3 font-montserrat">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-coral" />
                <span>support@booksmartly.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-coral" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground font-montserrat mb-4 md:mb-0">
            © {currentYear} BookSmartly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}