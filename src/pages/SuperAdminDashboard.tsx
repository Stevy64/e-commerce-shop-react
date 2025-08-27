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
import { Users, Store, Package, DollarSign, Crown, Gem, Star, TrendingUp, TrendingDown, Minus, Edit, MessageSquare, Eye, Trash2, Filter, Award, Zap } from "lucide-react";
import ConversationDetailsDialog from "@/components/ConversationDetailsDialog";
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
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [conversationFilter, setConversationFilter] = useState<string>("all");
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [selectedVendorForBadge, setSelectedVendorForBadge] = useState<any>(null);
  const [planUpgradeDialogOpen, setPlanUpgradeDialogOpen] = useState(false);
  const [selectedVendorForPlan, setSelectedVendorForPlan] = useState<any>(null);

  useEffect(() => {
    if (user && isSuperAdmin) {
      fetchDashboardData();
    }
  }, [user, isSuperAdmin]);

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

      // Récupérer les conversations avec détails
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants (
            user_id,
            role,
            profiles (
              display_name,
              first_name,
              last_name
            )
          )
        `)
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

  const updateVendorPlan = async (vendorId: string, plan: "basic" | "premium" | "golden") => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ plan })
        .eq('id', vendorId);

      if (error) throw error;

      toast.success('Plan mis à jour avec succès');
      setPlanUpgradeDialogOpen(false);
      setSelectedVendorForPlan(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du plan');
    }
  };

  const awardBadge = async (vendorId: string, badgeType: string, badgeName: string, description: string) => {
    try {
      const { error } = await supabase
        .from('vendor_badges')
        .insert({
          vendor_id: vendorId,
          badge_type: badgeType,
          badge_name: badgeName,
          description
        });

      if (error) throw error;

      toast.success('Badge attribué avec succès');
      setBadgeDialogOpen(false);
      setSelectedVendorForBadge(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Erreur lors de l\'attribution du badge:', error);
      toast.error('Erreur lors de l\'attribution du badge');
    }
  };

  const createConversation = async (vendorId: string, title: string) => {
    try {
      // Créer la conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title,
          type: 'support'
        })
        .select()
        .single();

      if (convError) throw convError;

      // Ajouter les participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: conversation.id,
            user_id: user!.id,
            role: 'admin'
          },
          {
            conversation_id: conversation.id,
            user_id: vendors.find(v => v.id === vendorId)?.user_id,
            role: 'participant'
          }
        ]);

      if (participantsError) throw participantsError;

      toast.success('Conversation créée avec succès');
      fetchDashboardData();
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
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

  const groupItemsByVendor = (items: any[], vendorKey: string = 'vendor_id') => {
    const grouped: { [key: string]: any[] } = {};
    
    items.forEach(item => {
      const vendorId = item[vendorKey] || 
                     (item.products && item.products.vendors?.id) ||
                     (item.vendors && item.vendors.id);
      
      if (!vendorId) return;
      
      if (!grouped[vendorId]) {
        grouped[vendorId] = [];
      }
      grouped[vendorId].push(item);
    });
    
    return grouped;
  };

  const openConversationDetails = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setConversationDialogOpen(true);
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
                              {vendor.email || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Ventes:</span><br />
                              {formatCurrency(vendor.total_sales || 0)}
                            </div>
                            <div>
                              <span className="font-medium">Commandes:</span><br />
                              {vendor.total_orders || 0}
                            </div>
                            <div>
                              <span className="font-medium">Performance:</span><br />
                              {vendor.performance_score || 0}/100
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {vendor.status === 'pending' && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => updateVendorStatus(vendor.id, 'approved')}
                              >
                                Approuver
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => updateVendorStatus(vendor.id, 'rejected')}
                              >
                                Rejeter
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedVendorForBadge(vendor);
                              setBadgeDialogOpen(true);
                            }}
                          >
                            <Award className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedVendorForPlan(vendor);
                              setPlanUpgradeDialogOpen(true);
                            }}
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => createConversation(vendor.id, `Support pour ${vendor.business_name}`)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Produits par Vendeur */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Produits par Vendeur</CardTitle>
                <CardDescription>Tous les produits organisés par vendeur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {vendors.map((vendor) => {
                    const vendorProducts = allProducts.filter(p => p.vendor_id === vendor.id);
                    if (vendorProducts.length === 0) return null;
                    
                    return (
                      <div key={vendor.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-lg font-semibold">{vendor.business_name}</h3>
                          <Badge variant={getPlanBadgeVariant(vendor.plan)}>
                            {vendor.plan}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {vendorProducts.length} produit{vendorProducts.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {vendorProducts.map((product) => (
                            <Card key={product.id} className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{product.title}</h4>
                                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                      {product.status}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <span className="font-medium">Prix:</span><br />
                                      {formatCurrency(product.price)}
                                    </div>
                                    <div>
                                      <span className="font-medium">Stock:</span><br />
                                      {product.stock_quantity || 0}
                                    </div>
                                    <div>
                                      <span className="font-medium">SKU:</span><br />
                                      {product.sku || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Détails du produit</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Titre</Label>
                                          <div className="p-2 bg-muted rounded">{product.title}</div>
                                        </div>
                                        <div>
                                          <Label>Description</Label>
                                          <div className="p-2 bg-muted rounded">{product.description || 'Aucune description'}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Prix</Label>
                                            <div className="p-2 bg-muted rounded">{formatCurrency(product.price)}</div>
                                          </div>
                                          <div>
                                            <Label>Stock</Label>
                                            <div className="p-2 bg-muted rounded">{product.stock_quantity || 0}</div>
                                          </div>
                                        </div>
                                        <div>
                                          <Label>Vendeur</Label>
                                          <div className="p-2 bg-muted rounded">{vendor.business_name}</div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => createConversation(vendor.id, `Produit: ${product.title}`)}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Commandes par Vendeur */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Commandes par Vendeur</CardTitle>
                <CardDescription>Toutes les commandes organisées par vendeur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupItemsByVendor(allOrders)).map(([vendorId, orders]) => {
                    const vendor = vendors.find(v => v.id === vendorId);
                    if (!vendor) return null;
                    
                    return (
                      <div key={vendorId} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-lg font-semibold">{vendor.business_name}</h3>
                          <Badge variant={getPlanBadgeVariant(vendor.plan)}>
                            {vendor.plan}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {orders.length} commande{orders.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {orders.map((order: any) => (
                            <Card key={order.id} className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">Commande #{order.id.slice(0, 8)}</h4>
                                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                      {order.status}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <span className="font-medium">Montant:</span><br />
                                      {formatCurrency(order.total_amount)}
                                    </div>
                                    <div>
                                      <span className="font-medium">Client:</span><br />
                                      {order.profiles?.display_name || 'Client'}
                                    </div>
                                    <div>
                                      <span className="font-medium">Date:</span><br />
                                      {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: fr })}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Détails de la commande</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Numéro</Label>
                                            <div className="p-2 bg-muted rounded">#{order.id.slice(0, 8)}</div>
                                          </div>
                                          <div>
                                            <Label>Statut</Label>
                                            <div className="p-2 bg-muted rounded">{order.status}</div>
                                          </div>
                                        </div>
                                        <div>
                                          <Label>Client</Label>
                                          <div className="p-2 bg-muted rounded">{order.profiles?.display_name || 'Client'}</div>
                                        </div>
                                        <div>
                                          <Label>Articles commandés</Label>
                                          <div className="p-2 bg-muted rounded">
                                            {order.order_items?.map((item: any, idx: number) => (
                                              <div key={idx} className="flex justify-between">
                                                <span>{item.products?.title}</span>
                                                <span>{item.quantity} x {formatCurrency(item.price)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <Label>Total</Label>
                                          <div className="p-2 bg-muted rounded font-semibold">{formatCurrency(order.total_amount)}</div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => createConversation(vendor.id, `Commande #${order.id.slice(0, 8)}`)}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Support par Vendeur */}
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support par Vendeur</CardTitle>
                <CardDescription>Tickets de support organisés par vendeur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupItemsByVendor(supportTickets)).map(([vendorId, tickets]) => {
                    const vendor = vendors.find(v => v.id === vendorId);
                    if (!vendor) return null;
                    
                    return (
                      <div key={vendorId} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-lg font-semibold">{vendor.business_name}</h3>
                          <Badge variant={getPlanBadgeVariant(vendor.plan)}>
                            {vendor.plan}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {tickets.length} ticket{tickets.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {tickets.map((ticket: any) => (
                            <Card key={ticket.id} className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{ticket.subject}</h4>
                                    <Badge variant={ticket.status === 'resolved' ? 'default' : 'destructive'}>
                                      {ticket.status}
                                    </Badge>
                                    <Badge variant="outline">
                                      {ticket.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                                  <div className="text-xs text-muted-foreground">
                                    Créé le {format(new Date(ticket.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Select
                                    value={ticket.status}
                                    onValueChange={(value) => {
                                      // updateSupportTicketStatus function would go here
                                    }}
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
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => createConversation(vendor.id, `Support: ${ticket.subject}`)}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Messagerie */}
          <TabsContent value="messaging">
            <Card>
              <CardHeader>
                <CardTitle>Messagerie</CardTitle>
                <CardDescription>Toutes les conversations de la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={conversationFilter} onValueChange={setConversationFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les conversations</SelectItem>
                      <SelectItem value="direct">Conversations directes</SelectItem>
                      <SelectItem value="order">Conversations de commande</SelectItem>
                      <SelectItem value="support">Conversations de support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  {conversations.filter(conv => {
                    if (conversationFilter === "all") return true;
                    return conv.type === conversationFilter;
                  }).map((conversation) => (
                    <Card key={conversation.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{conversation.title || 'Conversation'}</h3>
                            <Badge variant={conversation.type === 'order' ? 'default' : conversation.type === 'support' ? 'destructive' : 'secondary'}>
                              {conversation.type === 'order' ? 'Commande' : conversation.type === 'support' ? 'Support' : 'Direct'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Participants: {conversation.participantNames || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Créée le {format(new Date(conversation.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openConversationDetails(conversation.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
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
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Les fonctionnalités d'analyse avancées seront disponibles prochainement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog pour attribution de badges */}
      <Dialog open={badgeDialogOpen} onOpenChange={setBadgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attribuer un badge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vendeur</Label>
              <div className="p-2 bg-muted rounded">{selectedVendorForBadge?.business_name}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => awardBadge(selectedVendorForBadge?.id, 'top_seller', 'Top Vendeur', 'Badge pour les meilleurs vendeurs')}>
                Top Vendeur
              </Button>
              <Button onClick={() => awardBadge(selectedVendorForBadge?.id, 'quality', 'Qualité Premium', 'Badge pour la qualité des produits')}>
                Qualité Premium
              </Button>
              <Button onClick={() => awardBadge(selectedVendorForBadge?.id, 'customer_service', 'Service Client', 'Excellence en service client')}>
                Service Client
              </Button>
              <Button onClick={() => awardBadge(selectedVendorForBadge?.id, 'innovation', 'Innovation', 'Badge pour l\'innovation')}>
                Innovation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour upgrade de plan */}
      <Dialog open={planUpgradeDialogOpen} onOpenChange={setPlanUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le plan d'abonnement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vendeur</Label>
              <div className="p-2 bg-muted rounded">{selectedVendorForPlan?.business_name}</div>
            </div>
            <div>
              <Label>Plan actuel</Label>
              <div className="p-2 bg-muted rounded">{selectedVendorForPlan?.plan}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={selectedVendorForPlan?.plan === 'basic' ? 'default' : 'outline'}
                onClick={() => updateVendorPlan(selectedVendorForPlan?.id, 'basic')}
              >
                Basic
              </Button>
              <Button 
                variant={selectedVendorForPlan?.plan === 'premium' ? 'default' : 'outline'}
                onClick={() => updateVendorPlan(selectedVendorForPlan?.id, 'premium')}
              >
                Premium
              </Button>
              <Button 
                variant={selectedVendorForPlan?.plan === 'golden' ? 'default' : 'outline'}
                onClick={() => updateVendorPlan(selectedVendorForPlan?.id, 'golden')}
              >
                Golden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog des détails de conversation */}
      <ConversationDetailsDialog
        conversationId={selectedConversationId}
        isOpen={conversationDialogOpen}
        onClose={() => {
          setConversationDialogOpen(false);
          setSelectedConversationId(null);
        }}
      />

      <Footer />
    </div>
  );
}