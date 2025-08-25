import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-muted py-20">
        <div className="container text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">About us</h1>
          <p className="text-xl text-muted-foreground">WE DESIGN FURNITURE</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Our Core Divisions</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Ut leo. Vivamus aliquet elit ac nisl. Aenean leo ligula, porttitor eu, consequat vitae, eleifend
                ac enim. Sed cursus turpis vitae tortor. Vestibulum ante ipsum primis in faucibus orci luctus et 
                ultrices posuere cubilia Curae; Fusce id
              </p>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Furniture</span>
                    <span className="text-primary">70%</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Handmade</span>
                    <span className="text-primary">52%</span>
                  </div>
                  <Progress value={52} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Crafts</span>
                    <span className="text-primary">80%</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=500&fit=crop" 
                alt="Furniture workshop" 
                className="w-full h-64 object-cover rounded-lg"
              />
              <img 
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop" 
                alt="Modern living room" 
                className="w-full h-40 object-cover rounded-lg mt-12"
              />
            </div>
          </div>

          {/* Video Section */}
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=400&fit=crop" 
              alt="Video background" 
              className="w-full h-96 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
              <Button size="lg" className="w-16 h-16 rounded-full bg-white hover:bg-white/90 text-primary">
                <Play className="h-6 w-6 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-muted py-16">
        <div className="container text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">Exclusive offers for you</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Get weekly deals, valuable health information and more.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Sign Up
          </Button>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16">
        <div className="container text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">Join Our Community</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Get weekly deals, valuable health information and more.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;