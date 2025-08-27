import { Heart, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/utils/currency";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id?: string;
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  isNew?: boolean;
  description?: string;
  onQuickView?: (product: any) => void;
}

const ProductCard = ({ 
  id,
  image, 
  title, 
  price, 
  originalPrice, 
  discount, 
  isNew,
  description,
  onQuickView 
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemByProductId } = useWishlist();
  
  const handleAddToCart = () => {
    if (id) {
      addToCart(id);
    }
  };

  const handleToggleWishlist = () => {
    if (!id) return;
    
    if (isInWishlist(id)) {
      const wishlistItem = getWishlistItemByProductId(id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id);
      }
    } else {
      addToWishlist(id);
    }
  };

  const inWishlist = id ? isInWishlist(id) : false;

  const handleQuickView = () => {
    if (onQuickView && id) {
      const product = {
        id,
        title,
        image_url: image,
        price,
        original_price: originalPrice,
        discount,
        is_new: isNew,
        description
      };
      onQuickView(product);
    }
  };

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-accent text-accent-foreground">Nouveau</Badge>
          )}
          {discount && (
            <Badge variant="destructive">-{discount}%</Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            size="icon" 
            variant="secondary" 
            className={cn(
              "h-8 w-8",
              inWishlist ? "text-red-500" : ""
            )}
            onClick={handleToggleWishlist}
          >
            <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8"
            onClick={handleQuickView}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button 
            className="w-full rounded-none bg-primary hover:bg-primary/90"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ajouter au Panier
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">{title}</h3>
        </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;