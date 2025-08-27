import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
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
  AlertTriangle
} from "lucide-react";

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
          <TabsList>
            <TabsTrigger value="vendors">Gestion Vendeurs</TabsTrigger>
            <TabsTrigger value="commissions">Plans & Commissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
            <TabsTrigger value="gamification">Gamification</TabsTrigger>
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

          {/* Plans et commissions */}
          <TabsContent value="commissions" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Plan Basic
                  </CardTitle>
                  <CardDescription>Pour les nouveaux vendeurs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">15% Commission</div>
                  <ul className="space-y-2 text-sm">
                    <li>• Jusqu'à 50 produits</li>
                    <li>• Support standard</li>
                    <li>• Statistiques de base</li>
                    <li>• Frais de transaction: 2%</li>
                  </ul>
                  <Badge variant="outline">Critères: Débutant</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Plan Premium
                  </CardTitle>
                  <CardDescription>Pour les vendeurs actifs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">10% Commission</div>
                  <ul className="space-y-2 text-sm">
                    <li>• Jusqu'à 200 produits</li>
                    <li>• Support prioritaire</li>
                    <li>• Analytiques avancées</li>
                    <li>• Frais de transaction: 1.5%</li>
                  </ul>
                  <Badge variant="secondary">Critères: 10k FCFA + 50 commandes</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Plan Golden
                  </CardTitle>
                  <CardDescription>Pour les top vendeurs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">5% Commission</div>
                  <ul className="space-y-2 text-sm">
                    <li>• Produits illimités</li>
                    <li>• Support VIP 24/7</li>
                    <li>• Tableau de bord personnalisé</li>
                    <li>• Frais de transaction: 1%</li>
                  </ul>
                  <Badge variant="default">Critères: 50k FCFA + 200 commandes</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytiques */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution mensuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Graphiques d'évolution à implémenter
                    <br />
                    (Revenus, commandes, nouveaux vendeurs)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Vendeurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendors
                      .sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0))
                      .slice(0, 5)
                      .map((vendor, index) => (
                        <div key={vendor.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <span className="font-medium">{vendor.business_name}</span>
                          </div>
                          <span className="text-sm font-bold">
                            {vendor.total_sales?.toLocaleString() || 0} FCFA
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gamification */}
          <TabsContent value="gamification" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Système de badges
                  </CardTitle>
                  <CardDescription>
                    Récompenses pour motiver les vendeurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <div>
                        <div className="font-medium">Première Vente</div>
                        <div className="text-sm text-muted-foreground">Premier produit vendu</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium">Top Vendeur</div>
                        <div className="text-sm text-muted-foreground">Plus de 10k FCFA de ventes</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Crown className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="font-medium">Vendeur Elite</div>
                        <div className="text-sm text-muted-foreground">Plus de 100k FCFA de ventes</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Score de Performance</CardTitle>
                  <CardDescription>
                    Calcul automatique basé sur les ventes, commandes et avis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Ventes (40%)</span>
                        <span>40 points max</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Basé sur le volume de ventes mensuel
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Commandes (30%)</span>
                        <span>30 points max</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Nombre de commandes traitées
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Avis clients (30%)</span>
                        <span>30 points max</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Note moyenne des avis clients
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;