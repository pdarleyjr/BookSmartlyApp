import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { IOSButton } from "@/components/ui/ios-button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Image, User, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from "lucide-react";

// Sample portfolio data
const portfolioData = {
  photographer: {
    name: "Alex Morgan",
    bio: "Professional photographer with over 10 years of experience capturing life's most precious moments. Specializing in portrait, landscape, and event photography.",
    location: "San Francisco, CA",
    email: "alex@photofolio.com",
    phone: "+1 (555) 123-4567",
    social: {
      instagram: "@alexmorganphoto",
      twitter: "@alexmorganphoto",
      facebook: "alexmorganphotography"
    }
  },
  categories: [
    {
      id: "portraits",
      name: "Portraits",
      images: [
        { id: 1, src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop", alt: "Portrait 1" },
        { id: 2, src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=500&fit=crop", alt: "Portrait 2" },
        { id: 3, src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop", alt: "Portrait 3" },
        { id: 4, src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop", alt: "Portrait 4" },
        { id: 5, src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop", alt: "Portrait 5" },
        { id: 6, src: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=500&h=500&fit=crop", alt: "Portrait 6" }
      ]
    },
    {
      id: "landscapes",
      name: "Landscapes",
      images: [
        { id: 1, src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&h=500&fit=crop", alt: "Landscape 1" },
        { id: 2, src: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=500&h=500&fit=crop", alt: "Landscape 2" },
        { id: 3, src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&h=500&fit=crop", alt: "Landscape 3" },
        { id: 4, src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&h=500&fit=crop", alt: "Landscape 4" },
        { id: 5, src: "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?w=500&h=500&fit=crop", alt: "Landscape 5" },
        { id: 6, src: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=500&h=500&fit=crop", alt: "Landscape 6" }
      ]
    },
    {
      id: "events",
      name: "Events",
      images: [
        { id: 1, src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&h=500&fit=crop", alt: "Event 1" },
        { id: 2, src: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=500&h=500&fit=crop", alt: "Event 2" },
        { id: 3, src: "https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=500&h=500&fit=crop", alt: "Event 3" },
        { id: 4, src: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=500&h=500&fit=crop", alt: "Event 4" },
        { id: 5, src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=500&fit=crop", alt: "Event 5" },
        { id: 6, src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop", alt: "Event 6" }
      ]
    }
  ]
};

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState('portraits');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Local state for the modal
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  const handleTabChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleImageClick = (image: { src: string; alt: string }) => {
    setModalImage(image);
    setSelectedImage(image.src);
  };

  const closeModal = () => {
    setModalImage(null);
    setSelectedImage(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3">
              <div className="rounded-full overflow-hidden border-4 border-pastel-sky w-48 h-48 mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" 
                  alt="Alex Morgan" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">{portfolioData.photographer.name}</h1>
              <p className="text-lg text-muted-foreground mb-6 font-montserrat">{portfolioData.photographer.bio}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <IOSButton className="bg-pastel-sky text-black hover:bg-pastel-sky/90">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Me
                </IOSButton>
                <IOSButton variant="outline">
                  <Camera className="mr-2 h-4 w-4" />
                  Book a Session
                </IOSButton>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Gallery */}
        <section className="mb-12" id="portfolio">
          <h2 className="text-2xl font-bold mb-6 text-center font-poppins">My Portfolio</h2>
          
          <Tabs 
            defaultValue={selectedCategory} 
            value={selectedCategory}
            onValueChange={handleTabChange} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {portfolioData.categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="font-poppins"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {portfolioData.categories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {category.images.map(image => (
                    <Card 
                      key={image.id} 
                      className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                      onClick={() => handleImageClick(image)}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square">
                          <img 
                            src={image.src} 
                            alt={image.alt} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* About Section */}
        <section className="mb-12" id="about">
          <h2 className="text-2xl font-bold mb-6 text-center font-poppins">About Me</h2>
          <div className="bg-pastel-lavender/20 rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <img 
                  src="https://images.unsplash.com/photo-1542103749-8ef59b94f47e?w=500&h=700&fit=crop" 
                  alt="Alex Morgan at work" 
                  className="rounded-lg w-full h-auto object-cover"
                />
              </div>
              <div className="w-full md:w-2/3">
                <h3 className="text-xl font-semibold mb-4 font-poppins">My Journey</h3>
                <p className="text-muted-foreground mb-4 font-montserrat">
                  I began my photography journey over a decade ago, capturing the beauty of everyday moments. What started as a hobby quickly evolved into a passion and then a profession.
                </p>
                <p className="text-muted-foreground mb-4 font-montserrat">
                  My approach to photography is simple: I believe in capturing authentic moments that tell a story. Whether it's a wedding, a family portrait, or a breathtaking landscape, I strive to create images that evoke emotion and preserve memories.
                </p>
                <p className="text-muted-foreground font-montserrat">
                  When I'm not behind the camera, you can find me hiking in nature, exploring new coffee shops, or spending time with my family and our golden retriever, Max.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12 bg-pastel-mint/20 rounded-xl p-6" id="contact">
          <h2 className="text-2xl font-bold mb-6 text-center font-poppins">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-pastel-mint rounded-full p-4 mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 font-poppins">Email</h3>
              <p className="text-muted-foreground font-montserrat">{portfolioData.photographer.email}</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-pastel-lavender rounded-full p-4 mb-4">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 font-poppins">Phone</h3>
              <p className="text-muted-foreground font-montserrat">{portfolioData.photographer.phone}</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-pastel-peach rounded-full p-4 mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 font-poppins">Location</h3>
              <p className="text-muted-foreground font-montserrat">{portfolioData.photographer.location}</p>
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-6 font-poppins">Follow Me</h2>
          <div className="flex justify-center gap-6">
            <a href="#" className="bg-pastel-pink rounded-full p-4 transition-transform hover:scale-110">
              <Instagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="bg-pastel-sky rounded-full p-4 transition-transform hover:scale-110">
              <Twitter className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="bg-pastel-lavender rounded-full p-4 transition-transform hover:scale-110">
              <Facebook className="h-6 w-6" />
              <span className="sr-only">Facebook</span>
            </a>
          </div>
        </section>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img 
              src={modalImage.src.replace('w=500&h=500', 'w=1200&h=900')} 
              alt={modalImage.alt} 
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-4 right-4 bg-white/20 rounded-full p-2 hover:bg-white/40"
              onClick={closeModal}
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}