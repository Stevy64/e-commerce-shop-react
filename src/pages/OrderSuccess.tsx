import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Truck, Download } from "lucide-react";
import { Link } from "react-router-dom";

const OrderSuccess = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-foreground mb-4">Commande confirmée !</h1>
              <p className="text-lg text-muted-foreground">
                Merci pour votre commande. Nous avons reçu votre demande et commençons à la traiter.
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Commande traitée</h3>
                    <p className="text-sm text-muted-foreground">
                      Votre commande est en cours de préparation
                    </p>
                  </div>
                  <div className="text-center">
                    <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Expédition</h3>
                    <p className="text-sm text-muted-foreground">
                      Livraison estimée sous 3-5 jours ouvrables
                    </p>
                  </div>
                  <div className="text-center">
                    <Download className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Facture</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous recevrez votre facture par email
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Un email de confirmation a été envoyé à votre adresse email avec les détails de votre commande.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/shop">
                  <Button variant="outline">Continuer mes achats</Button>
                </Link>
                <Link to="/">
                  <Button>Retour à l'accueil</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderSuccess;