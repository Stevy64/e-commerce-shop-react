import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Eye, Package } from "lucide-react";
import { formatPrice } from "@/utils/currency";
import { Link } from "react-router-dom";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    id: string;
    title: string;
    image_url: string;
    description?: string;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderDetailsProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetails = ({ order, isOpen, onClose }: OrderDetailsProps) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'processing':
        return 'bg-warning text-warning-foreground';
      case 'shipped':
        return 'bg-primary text-primary-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'En cours de traitement';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  const handleDownloadInvoice = () => {
    // Génération de facture PDF simplifiée (à implémenter avec une vraie solution PDF)
    const invoiceContent = `
      FACTURE #${order.id.substring(0, 8).toUpperCase()}
      Date: ${new Date(order.created_at).toLocaleDateString()}
      
      Articles:
      ${order.order_items.map(item => 
        `${item.products.title} - Quantité: ${item.quantity} - Prix: ${formatPrice(item.price)}`
      ).join('\n')}
      
      Total: ${formatPrice(order.total_amount)}
      Statut: ${getStatusText(order.status)}
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facture-${order.id.substring(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Commande #{order.id.substring(0, 8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Commandée le {new Date(order.created_at).toLocaleDateString()}
              </p>
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </div>
            <Button onClick={handleDownloadInvoice} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger la facture
            </Button>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Articles commandés</h3>
            {order.order_items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.products.image_url}
                      alt={item.products.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <Link to={`/product/${item.product_id}`} onClick={onClose}>
                        <h4 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                          {item.products.title}
                        </h4>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.price)}</p>
                      <p className="text-sm text-muted-foreground">
                        Total: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Sous-total:</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Livraison:</span>
              <span>Gratuite</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Informations de livraison</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                Adresse de livraison par défaut<br />
                (Les informations de livraison peuvent être mises à jour dans votre profil)
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetails;