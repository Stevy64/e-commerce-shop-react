import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { Link, Navigate } from "react-router-dom";

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistItems, loading } = useWishlist();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-muted py-16">
        <div className="container">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/account">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au compte
              </Button>
            </Link>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">Ma Liste de Souhaits</h1>
          <p className="text-lg text-muted-foreground">
            {wishlistItems.length} produit{wishlistItems.length > 1 ? 's' : ''} dans votre liste de souhaits
          </p>
        </div>
      </section>

      {/* Wishlist Content */}
      <section className="py-16">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-foreground mb-4">Votre liste de souhaits est vide</h2>
              <p className="text-muted-foreground mb-8">Découvrez nos produits et ajoutez vos favoris à votre liste de souhaits</p>
              <Link to="/shop">
                <Button>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Découvrir nos produits
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.product_id}
                  image={item.products.image_url}
                  title={item.products.title}
                  price={item.products.price}
                  originalPrice={item.products.original_price}
                  discount={item.products.discount}
                  description={item.products.description}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Wishlist;