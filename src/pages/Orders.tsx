import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderDetails from "@/components/OrderDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Eye, Download, ArrowLeft, X, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/utils/currency";
import { downloadInvoice } from "@/utils/pdfGenerator";
import { Link, Navigate } from "react-router-dom";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      title: string;
      image_url: string;
    };
  }[];
}

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              id,
              title,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  /**
   * Retourne la couleur du badge selon le statut de la commande
   * @param status - Statut de la commande
   * @returns Classes CSS pour le styling du badge
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipping':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Retourne le texte français du statut
   * @param status - Statut de la commande
   * @returns Texte français du statut
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente de validation';
      case 'confirmed':
        return 'Validée';
      case 'shipping':
        return 'En cours de livraison';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  /**
   * Retourne la description du statut pour le tooltip
   * @param status - Statut de la commande
   * @returns Description du statut
   */
  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Votre commande est en attente de validation par notre équipe';
      case 'confirmed':
        return 'Votre commande a été confirmée et est en cours de préparation';
      case 'shipping':
        return 'Votre commande est en cours de livraison';
      case 'delivered':
        return 'Votre commande a été livrée avec succès';
      case 'cancelled':
        return 'Cette commande a été annulée';
      default:
        return 'Statut inconnu';
    }
  };

  /**
   * Vérifie si une commande peut être annulée
   * @param status - Statut de la commande
   * @returns true si la commande peut être annulée
   */
  const canCancelOrder = (status: string) => {
    return status === 'pending' || status === 'confirmed';
  };

  /**
   * Génère et télécharge une facture PDF (utilise l'utilitaire dédié)
   * @param order - Commande pour laquelle générer la facture
   */
  const downloadInvoicePDF = (order: Order) => {
    downloadInvoice(order);
  };

  /**
   * Annule une commande
   * @param orderId - ID de la commande à annuler
   */
  const cancelOrder = async (orderId: string) => {
    // Ici on pourrait ajouter une logique pour annuler la commande dans la base de données
    console.log('Annulation de la commande:', orderId);
    // Pour l'instant, on montre juste un message
    alert('Fonctionnalité d\'annulation en cours de développement');
  };

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
          <h1 className="text-5xl font-bold text-foreground mb-4">Mes Commandes</h1>
          <p className="text-lg text-muted-foreground">Suivez l'état de vos commandes et consultez votre historique d'achats</p>
        </div>
      </section>

      {/* Orders Content */}
      <section className="py-16">
        <div className="container">
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-foreground mb-4">Aucune commande</h2>
              <p className="text-muted-foreground mb-8">Vous n'avez pas encore passé de commande</p>
              <Link to="/shop">
                <Button>Commencer mes achats</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                      <div className="space-y-2 mb-4 lg:mb-0">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-xl font-semibold">Commande #{order.id.slice(0, 8)}</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusColor(order.status)}>
                                    {getStatusText(order.status)}
                                  </Badge>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getStatusDescription(order.status)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-muted-foreground">
                          Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          Total: {formatPrice(order.total_amount)}
                        </p>
                      </div>
                      
                       <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Détails
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadInvoicePDF(order)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Facture PDF
                        </Button>
                        {canCancelOrder(order.status) && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => cancelOrder(order.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Articles commandés:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <img
                              src={item.products.image_url}
                              alt={item.products.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.products.title}</p>
                              <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                              <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <OrderDetails 
        order={selectedOrder}
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
      />

      <Footer />
    </div>
  );
};

export default Orders;