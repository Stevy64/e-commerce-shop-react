import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Store, Package, DollarSign, Crown, Gem, Star, TrendingUp, TrendingDown, Minus, Edit, MessageSquare, Eye, Trash2 } from "lucide-react";
import { formatPrice as formatCurrency } from "@/utils/currency";
import { assignSuperAdminRole } from "@/utils/testSuperAdmin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function SuperAdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [vendors, setVendors] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vendors");
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [vendorEditDialogOpen, setVendorEditDialogOpen] = useState(false);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas les permissions pour accéder à cette page.
              </p>
              <Button onClick={async () => {
                const result = await assignSuperAdminRole();
                if (result.success) {
                  window.location.reload();
                }
              }}>
                Devenir Super Admin (Test)
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  useEffect(() => {
    if (user && isSuperAdmin) {
      fetchDashboardData();
    }
  }, [user, isSuperAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les vendeurs avec leurs profils
      const { data: vendorsData, error: vendorError } = await supabase
        .from('vendors')
        .select(`
          *,
          profiles!vendors_user_id_fkey (
            display_name,
            first_name,
            last_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (vendorError) {
        console.error('Erreur vendors:', vendorError);
      }
      setVendors(vendorsData || []);

      // Récupérer tous les produits
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          vendors!products_vendor_id_fkey (
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Erreur products:', productsError);
      }
      setAllProducts(productsData || []);

      // Récupérer toutes les commandes
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey (
            display_name,
            first_name,
            last_name
          ),
          order_items (
            *,
            products!order_items_product_id_fkey (
              title,
              vendors!products_vendor_id_fkey (
                business_name
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Erreur orders:', ordersError);
      }
      setAllOrders(ordersData || []);

      // Récupérer les tickets de support
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          vendors!support_tickets_vendor_id_fkey (
            business_name,
            profiles!vendors_user_id_fkey (
              display_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ticketsError) {
        console.error('Erreur tickets:', ticketsError);
      }
      setSupportTickets(ticketsData || []);

      // Récupérer les conversations (simplifié)
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (conversationsError) {
        console.error('Erreur conversations:', conversationsError);
      }
      setConversations(conversationsData || []);

      // Calculer les statistiques
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalVendors: vendorsData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (vendorId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ 
          status,
          approved_at: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', vendorId);

      if (error) throw error;

      toast.success(`Vendeur ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`);
      fetchDashboardData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const updateVendorData = async (vendorId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendorId);

      if (error) throw error;

      toast.success('Vendeur mis à jour avec succès');
      setVendorEditDialogOpen(false);
      setEditingVendor(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du vendeur');
    }
  };

  const updateSupportTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('Ticket mis à jour avec succès');
      fetchDashboardData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du ticket');
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'golden': return 'default';
      case 'premium': return 'secondary';
      case 'basic': return 'outline';
      default: return 'outline';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'golden': return Crown;
      case 'premium': return Star;
      case 'basic': return Store;
      default: return Store;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Super Admin</h1>
          <p className="text-muted-foreground">Gestion complète de la plateforme</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Utilisateurs</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Vendeurs</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.totalVendors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Commandes</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Revenus</span>
              </div>
              <div className="text-2xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="vendors">Vendeurs</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="messaging">Messagerie</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Onglet Vendeurs */}
          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Vendeurs</CardTitle>
                <CardDescription>Administrez les comptes vendeurs et leurs performances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.map((vendor) => (
                    <Card key={vendor.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{vendor.business_name}</h3>
                            <Badge variant={vendor.status === 'approved' ? 'default' : vendor.status === 'pending' ? 'secondary' : 'destructive'}>
                              {vendor.status === 'approved' ? 'Approuvé' : vendor.status === 'pending' ? 'En attente' : 'Rejeté'}
                            </Badge>
                            <Badge variant={getPlanBadgeVariant(vendor.plan)}>
                              {vendor.plan}
                            </Badge>
                          </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Email:</span><br />
                                {vendor.email || vendor.profiles?.email || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Nom:</span><br />
                                {vendor.profiles?.display_name || `${vendor.profiles?.first_name || ''} ${vendor.profiles?.last_name || ''}`}
                              </div>
                              <div>
                                <span className="font-medium">Ventes:</span><br />
                                {formatCurrency(vendor.total_sales || 0)}
                              </div>
                              <div>
                                <span className="font-medium">Commandes:</span><br />
                                {vendor.total_orders || 0}
                              </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                          {vendor.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => updateVendorStatus(vendor.id, 'approved')}>
                                Approuver
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => updateVendorStatus(vendor.id, 'rejected')}>
                                Rejeter
                              </Button>
                            </>
                          )}
                          <Dialog open={vendorEditDialogOpen} onOpenChange={setVendorEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingVendor(vendor)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Modifier le vendeur</DialogTitle>
                              </DialogHeader>
                              {editingVendor && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="business_name">Nom de l'entreprise</Label>
                                    <Input
                                      id="business_name"
                                      defaultValue={editingVendor.business_name}
                                      onChange={(e) => setEditingVendor({...editingVendor, business_name: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="commission_rate">Taux de commission (%)</Label>
                                    <Input
                                      id="commission_rate"
                                      type="number"
                                      defaultValue={editingVendor.commission_rate}
                                      onChange={(e) => setEditingVendor({...editingVendor, commission_rate: parseFloat(e.target.value)})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="plan">Plan</Label>
                                    <Select 
                                      defaultValue={editingVendor.plan}
                                      onValueChange={(value) => setEditingVendor({...editingVendor, plan: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                        <SelectItem value="golden">Golden</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button onClick={() => updateVendorData(editingVendor.id, editingVendor)}>
                                    Sauvegarder
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Produits */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Tous les Produits</CardTitle>
                <CardDescription>Gérez tous les produits de la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun produit trouvé</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allProducts.slice(0, 12).map((product) => (
                        <Card key={product.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover rounded" />
                              ) : (
                                <Package className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{product.title}</h4>
                              <p className="text-sm text-muted-foreground">{product.vendor?.business_name}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-semibold">{formatCurrency(product.price)}</span>
                                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                  {product.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Commandes */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les Commandes</CardTitle>
                <CardDescription>Surveillez toutes les commandes de la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune commande trouvée</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allOrders.slice(0, 10).map((order) => (
                        <Card key={order.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Commande #{order.id.slice(0, 8)}</h4>
                              <p className="text-sm text-muted-foreground">
                                {order.profiles?.display_name || `${order.profiles?.first_name} ${order.profiles?.last_name}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(order.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(order.total_amount)}</div>
                              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Support */}
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Tickets de Support</CardTitle>
                <CardDescription>Gérez les demandes d'aide des vendeurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun ticket de support</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {supportTickets.map((ticket) => (
                        <Card key={ticket.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{ticket.subject}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>#{ticket.id.slice(0, 8)}</span>
                                <span>•</span>
                                <span>{ticket.vendor?.business_name}</span>
                                <span>•</span>
                                <span>{format(new Date(ticket.created_at), 'dd/MM/yyyy', { locale: fr })}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge variant={ticket.status === 'open' ? 'destructive' : 'default'}>
                                {ticket.status}
                              </Badge>
                              <Badge variant="outline">{ticket.priority}</Badge>
                              <Select
                                defaultValue={ticket.status}
                                onValueChange={(value) => updateSupportTicketStatus(ticket.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Ouvert</SelectItem>
                                  <SelectItem value="in_progress">En cours</SelectItem>
                                  <SelectItem value="resolved">Résolu</SelectItem>
                                  <SelectItem value="closed">Fermé</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Messagerie */}
          <TabsContent value="messaging">
            <Card>
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>Surveillez les communications sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {conversations.slice(0, 10).map((conversation) => (
                        <Card key={conversation.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{conversation.title || 'Conversation sans titre'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {conversation.conversation_participants?.length || 0} participant(s)
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(conversation.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                              </p>
                            </div>
                            <Badge variant="outline">{conversation.type}</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Analytics */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Analyses et rapports détaillés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">Analytics avancées</h3>
                  <p>Les graphiques et rapports détaillés seront disponibles prochainement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}