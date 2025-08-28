import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Lock } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    province: "",
    paymentMethod: "airtel_money"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Veuillez vous connecter pour finaliser votre commande",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Panier vide",
        description: "Votre panier est vide",
      });
      return;
    }

    setLoading(true);

    try {
      // Créer la commande en base
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: getCartTotal(),
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Créer les éléments de commande
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Mettre à jour le statut de la commande à 'confirmed'
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Vider le panier
      await clearCart();

      toast({
        title: "Commande confirmée !",
        description: "Votre commande a été créée avec succès. Les vendeurs ont été notifiés.",
      });

      // Rediriger vers la page de succès avec l'ID de la commande
      navigate(`/order-success?orderId=${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de votre commande. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-16">
          <div className="container">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Commande</h1>
              <p className="text-muted-foreground mb-8">Veuillez vous connecter pour finaliser votre commande</p>
              <Link to="/auth">
                <Button>Se connecter</Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-16">
          <div className="container">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Panier vide</h1>
              <p className="text-muted-foreground mb-8">Votre panier est vide</p>
              <Link to="/shop">
                <Button>Continuer mes achats</Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-muted py-16">
        <div className="container">
          <h1 className="text-5xl font-bold text-foreground mb-4">Finaliser la commande</h1>
          <p className="text-lg text-muted-foreground">Dernière étape avant de recevoir vos produits</p>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-16">
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Checkout Form */}
              <div className="space-y-8">
                {/* Billing Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de facturation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Prénom *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Adresse *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Ville *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Province *</Label>
                        <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une province" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="estuaire">Estuaire</SelectItem>
                            <SelectItem value="haut-ogooue">Haut-Ogooué</SelectItem>
                            <SelectItem value="moyen-ogooue">Moyen-Ogooué</SelectItem>
                            <SelectItem value="ngounie">Ngounié</SelectItem>
                            <SelectItem value="nyanga">Nyanga</SelectItem>
                            <SelectItem value="ogooue-ivindo">Ogooué-Ivindo</SelectItem>
                            <SelectItem value="ogooue-lolo">Ogooué-Lolo</SelectItem>
                            <SelectItem value="ogooue-maritime">Ogooué-Maritime</SelectItem>
                            <SelectItem value="woleu-ntem">Woleu-Ntem</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Mode de paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Options de paiement mobile money et autres */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="airtel_money" 
                          checked={formData.paymentMethod === 'airtel_money'} 
                          onCheckedChange={() => handleInputChange('paymentMethod', 'airtel_money')}
                        />
                        <Label htmlFor="airtel_money" className="flex items-center">
                          <span className="ml-2">Airtel Money</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="moov_money" 
                          checked={formData.paymentMethod === 'moov_money'} 
                          onCheckedChange={() => handleInputChange('paymentMethod', 'moov_money')}
                        />
                        <Label htmlFor="moov_money" className="flex items-center">
                          <span className="ml-2">Moov Money</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="cash_on_delivery" 
                          checked={formData.paymentMethod === 'cash_on_delivery'} 
                          onCheckedChange={() => handleInputChange('paymentMethod', 'cash_on_delivery')}
                        />
                        <Label htmlFor="cash_on_delivery" className="flex items-center">
                          <span className="ml-2">Paiement à la livraison</span>
                        </Label>
                      </div>
                    </div>

                    {/* Informations supplémentaires pour Mobile Money */}
                    {(formData.paymentMethod === 'airtel_money' || formData.paymentMethod === 'moov_money') && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <Label htmlFor="mobileNumber">Numéro de téléphone *</Label>
                        <Input 
                          id="mobileNumber" 
                          placeholder="+241 XX XX XX XX" 
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Vous recevrez une notification de paiement sur ce numéro
                        </p>
                      </div>
                    )}

                    {/* Information pour paiement à la livraison */}
                    {formData.paymentMethod === 'cash_on_delivery' && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Vous paierez en espèces lors de la livraison de votre commande.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Lock className="mr-2 h-4 w-4" />
                      Vos informations de paiement sont sécurisées
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Résumé de la commande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.products.image_url}
                          alt={item.products.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.products.title}</h4>
                          <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.products.price * item.quantity)}</p>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Sous-total</span>
                        <span>{formatPrice(getCartTotal())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Livraison</span>
                        <span>Gratuite</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes</span>
                        <span>{formatPrice(0)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatPrice(getCartTotal())}</span>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Traitement..." : "Confirmer la commande"}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      En cliquant sur "Confirmer la commande", vous acceptez nos conditions d'utilisation.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;