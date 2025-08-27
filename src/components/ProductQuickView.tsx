import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Plus, Minus, Eye, Star } from "lucide-react";
import { formatPrice } from "@/utils/currency";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  original_price?: number;
  discount?: number;
  is_new?: boolean;
  description?: string;
}

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView = ({ product, isOpen, onClose }: ProductQuickViewProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemByProductId } = useWishlist();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      const wishlistItem = getWishlistItemByProductId(product.id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id);
      }
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Aperçu du produit</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.is_new && (
                  <Badge className="bg-accent text-accent-foreground">Nouveau</Badge>
                )}
                {product.discount && (
                  <Badge variant="destructive">-{product.discount}%</Badge>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-4">{product.title}</h2>
              
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8) 127 avis</span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description.length > 150 
                  ? `${product.description.substring(0, 150)}...` 
                  : product.description
                }
              </p>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="font-medium">Quantité:</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ajouter au Panier
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleToggleWishlist}
                  className={cn(inWishlist && "text-red-500")}
                >
                  <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                </Button>
              </div>
              
              <Link to={`/product/${product.id}`} onClick={onClose}>
                <Button variant="outline" size="lg" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails complets
                </Button>
              </Link>
            </div>

            {/* Product Info */}
            <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
              <p><strong>SKU:</strong> {product.id.substring(0, 8).toUpperCase()}</p>
              <p><strong>Catégorie:</strong> Mobilier</p>
              <p><strong>Disponibilité:</strong> En stock</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;