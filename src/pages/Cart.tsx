import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/utils/currency";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cartItems, loading, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-16">
          <div className="container">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Panier</h1>
              <p className="text-muted-foreground mb-8">Veuillez vous connecter pour voir votre panier</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-16">
          <div className="container">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-8">Panier</h1>
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-muted rounded-lg"></div>
                <div className="h-24 bg-muted rounded-lg"></div>
                <div className="h-24 bg-muted rounded-lg"></div>
              </div>
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
              <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-foreground mb-4">Votre panier est vide</h1>
              <p className="text-muted-foreground mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
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
          <h1 className="text-5xl font-bold text-foreground mb-4">Panier</h1>
          <p className="text-lg text-muted-foreground">
            {cartItems.length} article{cartItems.length > 1 ? 's' : ''} dans votre panier
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Articles</h2>
                <Button variant="ghost" onClick={clearCart} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider le panier
                </Button>
              </div>

              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <div className="sm:col-span-2 flex items-center space-x-4">
                        <img
                          src={item.products.image_url}
                          alt={item.products.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div>
                          <Link to={`/product/${item.product_id}`}>
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">{item.products.title}</h3>
                          </Link>
                          <p className="text-lg font-bold text-primary">{formatPrice(item.products.price)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4 py-2 min-w-[3rem] text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="font-bold text-lg">
                          {formatPrice(item.products.price * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6">Résumé de la commande</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span>Gratuite</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Code promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <Button variant="outline">Appliquer</Button>
                    </div>
                  </div>

                  <Link to="/checkout">
                    <Button className="w-full" size="lg">
                      Procéder au paiement
                    </Button>
                  </Link>
                  
                  <Link to="/shop">
                    <Button variant="ghost" className="w-full mt-2">
                      Continuer mes achats
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;