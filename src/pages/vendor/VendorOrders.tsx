import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Package, Truck, CheckCircle, Clock, Eye, ArrowUpRight } from "lucide-react";
import { formatPrice as formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function VendorOrders() {
  const { user, loading: authLoading } = useAuth();
  const { isVendor, loading: roleLoading } = useUserRole();
  const { orders, stats, loading, updateOrderStatus, getOrderDetails } = useVendorOrders();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isVendor) {
    return <Navigate to="/become-vendor" replace />;
  }

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, label: "En attente", icon: Clock },
      processing: { variant: "default" as const, label: "En cours", icon: Package },
      shipped: { variant: "default" as const, label: "Expédiée", icon: Truck },
      completed: { variant: "default" as const, label: "Terminée", icon: CheckCircle },
      cancelled: { variant: "destructive" as const, label: "Annulée", icon: Clock }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const handleViewOrder = async (orderId: string) => {
    const orderDetails = await getOrderDetails(orderId);
    if (orderDetails) {
      setSelectedOrder(orderDetails);
      setOrderDialogOpen(true);
    }
  };

  const getOrderTotal = (order: any) => {
    return order.order_items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Mes Commandes</h1>
              <p className="text-muted-foreground">Gérez vos commandes et expéditions</p>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID commande ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="shipped">Expédiée</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total_orders}</div>
                <div className="text-sm text-muted-foreground">Total commandes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending_orders}</div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.completed_orders}</div>
                <div className="text-sm text-muted-foreground">Terminées</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                <div className="text-sm text-muted-foreground">Chiffre d'affaires</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Liste des commandes */}
        {loading ? (
          <div className="text-center py-8">Chargement des commandes...</div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune commande trouvée</h3>
              <p className="text-muted-foreground">
                {orders.length === 0 
                  ? "Vous n'avez pas encore reçu de commandes"
                  : "Aucune commande ne correspond à vos critères de recherche"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">Commande #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(getOrderTotal(order))}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.order_items.length} article{order.order_items.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Client</h4>
                      <p className="text-sm">
                        {order.customer?.first_name} {order.customer?.last_name}
                      </p>
                      {order.customer?.phone && (
                        <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Articles</h4>
                      <div className="space-y-1">
                        {order.order_items.slice(0, 2).map((item: any) => (
                          <p key={item.id} className="text-sm">
                            {item.quantity}x {item.product.title}
                          </p>
                        ))}
                        {order.order_items.length > 2 && (
                          <p className="text-sm text-muted-foreground">
                            +{order.order_items.length - 2} autre{order.order_items.length - 2 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir détails
                        </Button>
                      </DialogTrigger>
                      {selectedOrder && (
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Commande #{selectedOrder.id.slice(0, 8)}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Informations client</h4>
                                <div className="space-y-1 text-sm">
                                  <p>{selectedOrder.profiles?.[0]?.first_name} {selectedOrder.profiles?.[0]?.last_name}</p>
                                  <p>{selectedOrder.profiles?.[0]?.phone}</p>
                                  <p>{selectedOrder.profiles?.[0]?.address}</p>
                                  <p>{selectedOrder.profiles?.[0]?.city}, {selectedOrder.profiles?.[0]?.province}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Détails commande</h4>
                                <div className="space-y-1 text-sm">
                                  <p>Date: {format(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm')}</p>
                                  <p>Statut: {getStatusBadge(selectedOrder.status)}</p>
                                  <p>Total: {formatCurrency(selectedOrder.total_amount)}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Articles commandés</h4>
                              <div className="space-y-2">
                                {selectedOrder.order_items?.map((item: any) => (
                                  <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                                    <div>
                                      <p className="font-medium">{item.product?.title}</p>
                                      <p className="text-sm text-muted-foreground">SKU: {item.product?.sku}</p>
                                    </div>
                                    <div className="text-right">
                                      <p>{item.quantity}x {formatCurrency(item.price)}</p>
                                      <p className="font-medium">{formatCurrency(item.quantity * item.price)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>

                    {(order.status === 'pending' || order.status === 'processing') && (
                      <Select onValueChange={(value) => handleStatusUpdate(order.id, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Changer statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">Marquer en cours</SelectItem>
                          <SelectItem value="shipped">Marquer expédiée</SelectItem>
                          <SelectItem value="completed">Marquer terminée</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/order-success?orderId=${order.id}`)}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      Voir sur le site
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}