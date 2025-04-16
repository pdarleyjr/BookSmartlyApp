import { Camera, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-6 w-6 text-pastel-sky" />
              <h2 className="text-xl font-poppins font-bold">PhotoFolio</h2>
            </div>
            <p className="text-muted-foreground mb-4 font-montserrat">
              Capturing life's precious moments with artistic vision and technical excellence.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-poppins">Quick Links</h3>
            <ul className="space-y-2 font-montserrat">
              <li><Link to="/" className="hover:text-pastel-sky">Home</Link></li>
              <li><Link to="#portfolio" className="hover:text-pastel-sky">Portfolio</Link></li>
              <li><Link to="#about" className="hover:text-pastel-sky">About</Link></li>
              <li><Link to="#contact" className="hover:text-pastel-sky">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-poppins">Contact</h3>
            <ul className="space-y-3 font-montserrat">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-pastel-sky" />
                <span>alex@photofolio.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-pastel-sky" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-pastel-sky" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground font-montserrat mb-4 md:mb-0">
            © {currentYear} PhotoFolio. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-pastel-sky">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-pastel-sky">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-pastel-sky">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}