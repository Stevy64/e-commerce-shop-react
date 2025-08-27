import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">Gabomazone</h3>
            <p className="text-muted-foreground mb-4">
              Votre partenaire de confiance pour des produits de mode et de style de vie premium. 
              Nous vous apportons les dernières tendances de nos meilleures boutiques locales.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Returns</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Track Your Order</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Size Guide</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Stay Updated</h4>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter and get 10% off your first order!
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1"
              />
              <Button>
                <Mail className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4">
              <h5 className="font-medium text-foreground mb-2">Contact Info</h5>
              <p className="text-sm text-muted-foreground">
                Email: support@gabomazone.ga<br />
                Téléphone: +241 XX XX XX XX<br />
                Adresse: Libreville, Gabon
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Gabomazone. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <img src="https://via.placeholder.com/40x25?text=VISA" alt="Visa" className="h-6" />
            <img src="https://via.placeholder.com/40x25?text=MC" alt="Mastercard" className="h-6" />
            <img src="https://via.placeholder.com/40x25?text=PP" alt="PayPal" className="h-6" />
            <img src="https://via.placeholder.com/40x25?text=AMEX" alt="American Express" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;