import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useVendor } from "@/hooks/useVendor";
import { useProducts } from "@/hooks/useProducts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPrice } from "@/utils/currency";
import { Link } from "react-router-dom";
import { 
  Store, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";
import VendorProductsTab from "@/components/VendorProductsTab";
import VendorShopsTab from "@/components/VendorShopsTab";
import VendorProfileTab from "@/components/VendorProfileTab";
import VendorNotifications from "@/components/VendorNotifications";

/**
 * Dashboard vendeur inspiré d'Amazon Seller Central
 * Centre de gestion complet pour les vendeurs Gabomazone
 */

const VendorDashboard = () => {
  const { user } = useAuth();
  const { vendor, shops, stats, loading, hasVendorProfile, isApprovedVendor } = useVendor();
  const { products } = useProducts();
  const navigate = useNavigate();

  // Redirection si pas connecté
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Redirection si pas de profil vendeur
  if (!loading && !hasVendorProfile()) {
    navigate('/become-vendor');
    return null;
  }

  // Statut de l'approbation
  const getStatusInfo = () => {
    switch (vendor?.status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Compte approuvé',
          description: 'Votre compte vendeur est actif',
          variant: 'default' as const
        };
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          text: 'En attente d\'approbation',
          description: 'Nous examinons votre demande sous 48h',
          variant: 'secondary' as const
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          text: 'Demande rejetée',
          description: 'Contactez le support pour plus d\'informations',
          variant: 'destructive' as const
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
          text: 'Statut inconnu',
          description: 'Contactez le support',
          variant: 'secondary' as const
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête du dashboard */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord vendeur</h1>
            <p className="text-muted-foreground">
              Bienvenue {vendor?.business_name || 'Vendeur'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <Badge variant={statusInfo.variant}>
              {statusInfo.text}
            </Badge>
          </div>
        </div>

        {/* Alerte statut */}
        {vendor?.status !== 'approved' && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {statusInfo.description}
              {vendor?.status === 'pending' && 
                " Vous recevrez un email dès que votre compte sera activé."
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits totaux</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.active_products || 0} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total des ventes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_revenue ? `${stats.total_revenue.toLocaleString()} FCFA` : '0 FCFA'}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenus totaux
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.average_rating ? `${stats.average_rating.toFixed(1)}/5` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Satisfaction client
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="products">Mes produits</TabsTrigger>
            <TabsTrigger value="shops">Mes boutiques</TabsTrigger>
            <TabsTrigger value="profile">Profil vendeur</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {/* Notifications */}
            <VendorNotifications />
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Actions rapides */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                  <CardDescription>
                    Gérez votre activité en quelques clics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/vendor/products/new')}
                    disabled={!isApprovedVendor()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un produit
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/vendor/products')}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Gérer mes produits
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/vendor/orders')}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Voir mes commandes
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/vendor/analytics')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Statistiques détaillées
                  </Button>
                </CardContent>
              </Card>

              {/* Informations compte */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Business:</span>
                    <span className="text-sm">{vendor?.business_name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Type:</span>
                    <span className="text-sm capitalize">{vendor?.business_type}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Commission:</span>
                    <span className="text-sm">{vendor?.commission_rate}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Membre depuis:</span>
                    <span className="text-sm">
                      {vendor?.created_at ? 
                        new Date(vendor.created_at).toLocaleDateString('fr-FR') : 
                        'N/A'
                      }
                    </span>
                  </div>

                  <Separator />
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/vendor/profile')}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier le profil
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Aide et ressources */}
            <Card>
              <CardHeader>
                <CardTitle>Centre d'aide vendeur</CardTitle>
                <CardDescription>
                  Ressources pour optimiser vos ventes sur Gabomazone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start" asChild>
                    <Link to="/vendor/guide">
                      <Eye className="mr-2 h-4 w-4" />
                      Guide du vendeur
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link to="/vendor/messaging">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Ma messagerie
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link to="/vendor/support">
                      <Store className="mr-2 h-4 w-4" />
                      Support vendeur
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <VendorProductsTab />
          </TabsContent>

          {/* Mes boutiques */}
          <TabsContent value="shops">
            <VendorShopsTab />
          </TabsContent>

          {/* Profil vendeur */}
          <TabsContent value="profile">
            <VendorProfileTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDashboard;