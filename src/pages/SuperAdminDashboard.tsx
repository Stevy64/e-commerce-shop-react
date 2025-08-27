import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useMessaging } from "@/hooks/useMessaging";
import { useUserRole } from "@/hooks/useUserRole";
import { assignSuperAdminRole } from "@/utils/testSuperAdmin";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Store, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Crown,
  CheckCircle,
  XCircle,
  Settings,
  Award,
  Target,
  Zap,
  Star,
  ShieldCheck,
  AlertTriangle,
  Package,
  BarChart3,
  HelpCircle,
  Trophy,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Dashboard Super Admin inspiré des meilleures pratiques
 * Gestion complète des utilisateurs, vendeurs, commissions et gamification
 */

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const { 
    adminStats, 
    vendors, 
    loading, 
    approveVendor,
    rejectVendor,
    updateVendorCommission,
    updateVendorPlan
  } = useAdmin();
  const { supportTickets, fetchSupportTickets } = useMessaging();
  const navigate = useNavigate();

  const handleBecomeSuperAdmin = async () => {
    const result = await assignSuperAdminRole();
    if (result.success) {
      window.location.reload(); // Recharger pour mettre à jour le rôle
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Vérification des permissions...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Accès Refusé</h1>
            <p className="text-muted-foreground mb-8">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <div className="space-y-4">
              <Button onClick={handleBecomeSuperAdmin} variant="outline">
                Devenir Super Admin (Test)
              </Button>
              <div>
                <Button onClick={() => navigate('/')} variant="default">
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Fonction pour obtenir la couleur du badge selon le plan
  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'golden': return 'default';
      case 'premium': return 'secondary';
      case 'basic': return 'outline';
      default: return 'outline';
    }
  };

  // Fonction pour obtenir l'icône du plan
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'golden': return <Crown className="w-4 h-4" />;
      case 'premium': return <Star className="w-4 h-4" />;
      case 'basic': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  // Fonction pour obtenir le score de performance en couleur
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête du dashboard */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Gestion complète de la plateforme Gabomazone
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="default" className="flex items-center gap-1">
              <Crown className="w-4 h-4" />
              Super Admin
            </Badge>
          </div>
        </div>

        {/* Alertes importantes */}
        {adminStats.pending_vendors > 0 && (
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {adminStats.pending_vendors} vendeur{adminStats.pending_vendors > 1 ? 's' : ''} en attente d'approbation
            </AlertDescription>
          </Alert>
        )}

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                Utilisateurs inscrits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendeurs</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.total_vendors}</div>
              <p className="text-xs text-muted-foreground">
                {adminStats.active_vendors} actifs, {adminStats.pending_vendors} en attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.total_orders}</div>
              <p className="text-xs text-muted-foreground">
                Commandes totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adminStats.total_revenue.toLocaleString()} FCFA
              </div>
              <p className="text-xs text-muted-foreground">
                Revenus de la plateforme
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vendors">Vendeurs</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Gestion des vendeurs */}
          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendeurs de la plateforme</CardTitle>
                <CardDescription>
                  Gérez les vendeurs, leurs statuts et leurs performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.map((vendor) => (
                    <Card key={vendor.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{vendor.business_name}</h3>
                            <Badge 
                              variant={vendor.status === 'approved' ? 'default' : 
                                      vendor.status === 'pending' ? 'secondary' : 'destructive'}
                            >
                              {vendor.status === 'approved' ? 'Approuvé' :
                               vendor.status === 'pending' ? 'En attente' : 'Rejeté'}
                            </Badge>
                            <Badge variant={getPlanBadgeVariant(vendor.plan)} className="flex items-center gap-1">
                              {getPlanIcon(vendor.plan)}
                              {vendor.plan.charAt(0).toUpperCase() + vendor.plan.slice(1)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Email:</span><br />
                              {vendor.email}
                            </div>
                            <div>
                              <span className="font-medium">Ventes:</span><br />
                              {vendor.total_sales?.toLocaleString() || 0} FCFA
                            </div>
                            <div>
                              <span className="font-medium">Commandes:</span><br />
                              {vendor.total_orders || 0}
                            </div>
                            <div>
                              <span className="font-medium">Performance:</span><br />
                              <span className={getPerformanceColor(vendor.performance_score || 0)}>
                                {vendor.performance_score || 0}/100
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          {vendor.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveVendor(vendor.id)}
                                className="flex-1"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectVendor(vendor.id)}
                                className="flex-1"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rejeter
                              </Button>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Commission %"
                              defaultValue={vendor.commission_rate}
                              className="flex-1"
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value && value !== vendor.commission_rate) {
                                  updateVendorCommission(vendor.id, value);
                                }
                              }}
                            />
                            <Select
                              defaultValue={vendor.plan}
                              onValueChange={(value) => updateVendorPlan(vendor.id, value as any)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="golden">Golden</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des produits */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gestion des Produits
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble de tous les produits vendeur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">Interface produits en développement</h3>
                  <p>La gestion centralisée des produits sera bientôt disponible</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des commandes */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Gestion des Commandes
                </CardTitle>
                <CardDescription>
                  Suivi de toutes les commandes de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">Interface commandes en développement</h3>
                  <p>Le suivi centralisé des commandes sera bientôt disponible</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support tickets */}
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Tickets de Support
                </CardTitle>
                <CardDescription>
                  Gestion des demandes support des vendeurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold text-lg mb-2">Aucun ticket de support</h3>
                      <p>Les demandes d'aide des vendeurs apparaîtront ici</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {supportTickets.map((ticket) => (
                        <Card key={ticket.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{ticket.subject}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {ticket.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>#{ticket.id.slice(0, 8)}</span>
                                <span>•</span>
                                <span>{format(new Date(ticket.created_at), 'dd/MM/yyyy à HH:mm')}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 ml-4">
                              <Badge variant={ticket.status === 'open' ? 'destructive' : 'default'}>
                                {ticket.status === 'open' ? 'Ouvert' : 'Fermé'}
                              </Badge>
                              <Badge variant="outline">
                                {ticket.priority === 'urgent' ? 'Urgent' : 
                                 ticket.priority === 'high' ? 'Haute' :
                                 ticket.priority === 'medium' ? 'Moyenne' : 'Faible'}
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

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Avancées
                </CardTitle>
                <CardDescription>
                  Analyses détaillées de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">Analytics avancées en développement</h3>
                  <p>Les graphiques détaillés et rapports seront bientôt disponibles</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;