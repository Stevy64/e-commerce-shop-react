import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Eye, Clock, CheckCircle, XCircle, Edit, TrendingUp } from "lucide-react";
import { formatPrice } from "@/utils/currency";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  discount?: number;
  stock_quantity?: number;
  image_url?: string;
  status: string;
  sku?: string;
  created_at: string;
  updated_at: string;
  is_new?: boolean;
}

interface ProductDetailsProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (productId: string) => void;
}

export default function ProductDetails({ product, isOpen, onClose, onEdit }: ProductDetailsProps) {
  if (!product) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: "secondary" as const, label: "Brouillon", icon: Clock, color: "text-gray-600" },
      active: { variant: "default" as const, label: "Actif", icon: CheckCircle, color: "text-green-600" },
      inactive: { variant: "destructive" as const, label: "Inactif", icon: XCircle, color: "text-red-600" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const calculateDiscountedPrice = () => {
    if (product.discount && product.discount > 0) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const finalPrice = calculateDiscountedPrice();
  const hasDiscount = product.discount && product.discount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Détails du Produit
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image du produit */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="h-16 w-16" />
                </div>
              )}
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(product.status)}
              {product.is_new && (
                <Badge variant="default" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Nouveau
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive">
                  -{product.discount}%
                </Badge>
              )}
            </div>
          </div>

          {/* Informations du produit */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
              {product.sku && (
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              )}
            </div>

            {/* Prix */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(finalPrice)}
                </span>
                {hasDiscount && product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-green-600 font-medium">
                  Économisez {formatPrice((product.original_price || product.price) - finalPrice)}
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Informations détaillées */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Stock</h4>
                <p className="text-lg font-semibold">
                  {product.stock_quantity || 0} unités
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Statut</h4>
                <div className="text-sm">
                  {product.status === 'draft' && 'Non visible sur le site'}
                  {product.status === 'active' && 'Visible et achetable'}
                  {product.status === 'inactive' && 'Visible mais non achetable'}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Prix original</h4>
                <p className="text-lg">
                  {formatPrice(product.original_price || product.price)}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Remise</h4>
                <p className="text-lg">
                  {product.discount || 0}%
                </p>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Créé le:</span>
                <span>{format(new Date(product.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Modifié le:</span>
                <span>{format(new Date(product.updated_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {onEdit && (
                <Button onClick={() => onEdit(product.id)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Modifier le produit
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}