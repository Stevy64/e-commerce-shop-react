import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useVendor } from "@/hooks/useVendor";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Settings, 
  HelpCircle,
  CheckCircle,
  Package,
  CreditCard,
  Truck,
  Star,
  AlertCircle
} from "lucide-react";

export default function VendorGuide() {
  const { user, loading: authLoading } = useAuth();
  const { vendor, isApprovedVendor } = useVendor();

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!vendor) {
    return <Navigate to="/become-vendor" replace />;
  }

  const GuideSection = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  const StepList = ({ steps }: { steps: { title: string, description: string }[] }) => (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
            {index + 1}
          </div>
          <div>
            <h4 className="font-medium">{step.title}</h4>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Guide du Vendeur</h1>
          </div>
          <p className="text-muted-foreground">
            Tout ce que vous devez savoir pour réussir sur Gabomazone
          </p>
          {!isApprovedVendor() && (
            <Badge variant="secondary" className="mt-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              Compte en attente d'approbation
            </Badge>
          )}
        </div>

        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="getting-started">Démarrage</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="optimization">Optimisation</TabsTrigger>
            <TabsTrigger value="policies">Politiques</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[70vh]">
            <TabsContent value="getting-started" className="space-y-6">
              <GuideSection icon={CheckCircle} title="Premiers pas sur Gabomazone">
                <p className="text-muted-foreground">
                  Bienvenue dans l'écosystème Gabomazone ! Suivez ces étapes pour bien commencer votre activité de vendeur.
                </p>
                <StepList steps={[
                  {
                    title: "Attendez l'approbation de votre compte",
                    description: "Notre équipe examine votre demande vendeur sous 48h maximum. Vous recevrez un email de confirmation."
                  },
                  {
                    title: "Créez votre première boutique",
                    description: "Une fois approuvé, créez votre boutique avec un nom accrocheur et une description détaillée."
                  },
                  {
                    title: "Configurez votre profil vendeur",
                    description: "Complétez vos informations business, coordonnées et informations fiscales."
                  },
                  {
                    title: "Ajoutez vos premiers produits",
                    description: "Créez vos premiers articles avec des photos de qualité et des descriptions détaillées."
                  },
                  {
                    title: "Configurez vos options de livraison",
                    description: "Définissez vos zones de livraison et tarifs d'expédition."
                  }
                ]} />
              </GuideSection>

              <GuideSection icon={TrendingUp} title="Système de plans vendeur">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Plan Basic
                      </CardTitle>
                      <Badge variant="secondary">Gratuit</Badge>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="space-y-1">
                        <li>• Commission: 10%</li>
                        <li>• Produits illimités</li>
                        <li>• Support standard</li>
                        <li>• Statistiques de base</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Plan Premium
                      </CardTitle>
                      <Badge variant="default">Auto-upgrade à 10k FCFA</Badge>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="space-y-1">
                        <li>• Commission: 7%</li>
                        <li>• Outils marketing avancés</li>
                        <li>• Support prioritaire</li>
                        <li>• Analytics détaillées</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-yellow-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Plan Golden
                      </CardTitle>
                      <Badge className="bg-yellow-500">Auto-upgrade à 50k FCFA</Badge>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="space-y-1">
                        <li>• Commission: 5%</li>
                        <li>• Compte manager dédié</li>
                        <li>• Promotions premium</li>
                        <li>• Intégration API</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </GuideSection>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <GuideSection icon={Package} title="Créer des produits de qualité">
                <StepList steps={[
                  {
                    title: "Photos de qualité",
                    description: "Utilisez des images haute résolution avec un bon éclairage. Montrez le produit sous plusieurs angles."
                  },
                  {
                    title: "Titre optimisé",
                    description: "Créez un titre clair avec les mots-clés principaux. Maximum 60 caractères recommandés."
                  },
                  {
                    title: "Description détaillée",
                    description: "Décrivez précisément les caractéristiques, dimensions, matériaux et utilisation du produit."
                  },
                  {
                    title: "Prix compétitif",
                    description: "Recherchez les prix du marché et positionnez-vous de manière compétitive."
                  },
                  {
                    title: "Gestion du stock",
                    description: "Maintenez vos stocks à jour pour éviter les ruptures et les commandes impossibles."
                  }
                ]} />
              </GuideSection>

              <GuideSection icon={Settings} title="Optimisation produits">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Mots-clés efficaces</h4>
                    <p className="text-sm text-muted-foreground">
                      Utilisez des mots-clés pertinents dans vos titres et descriptions pour améliorer la visibilité.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Catégorisation</h4>
                    <p className="text-sm text-muted-foreground">
                      Placez vos produits dans les bonnes catégories pour faciliter leur découverte.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Variations produit</h4>
                    <p className="text-sm text-muted-foreground">
                      Proposez différentes tailles, couleurs ou modèles pour maximiser vos ventes.
                    </p>
                  </div>
                </div>
              </GuideSection>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <GuideSection icon={ShoppingBag} title="Gestion des commandes">
                <StepList steps={[
                  {
                    title: "Réception de commande",
                    description: "Vous recevez une notification et un email dès qu'une commande est passée."
                  },
                  {
                    title: "Préparation (24-48h)",
                    description: "Préparez la commande et marquez-la 'En cours' dans votre tableau de bord."
                  },
                  {
                    title: "Expédition",
                    description: "Emballez soigneusement et expédiez. Marquez la commande comme 'Expédiée'."
                  },
                  {
                    title: "Suivi client",
                    description: "Communiquez avec le client via la messagerie pour le suivi de livraison."
                  },
                  {
                    title: "Finalisation",
                    description: "Une fois livrée, la commande passe automatiquement en 'Terminée'."
                  }
                ]} />
              </GuideSection>

              <GuideSection icon={Truck} title="Expédition et livraison">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Zones de livraison</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Libreville: 1-2 jours</li>
                      <li>• Port-Gentil: 2-3 jours</li>
                      <li>• Autres villes: 3-5 jours</li>
                      <li>• Zone rurale: 5-7 jours</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tarifs standards</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Libreville: 1000 FCFA</li>
                      <li>• Port-Gentil: 2000 FCFA</li>
                      <li>• Autres villes: 3000 FCFA</li>
                      <li>• Gratuit dès 25000 FCFA</li>
                    </ul>
                  </div>
                </div>
              </GuideSection>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-6">
              <GuideSection icon={TrendingUp} title="Optimiser ses ventes">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Stratégies de prix</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Analysez la concurrence régulièrement</li>
                      <li>• Proposez des remises temporaires</li>
                      <li>• Créez des packs produits</li>
                      <li>• Utilisez la psychologie des prix (ex: 9 999 FCFA au lieu de 10 000)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Service client</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Répondez rapidement aux messages (moins de 2h)</li>
                      <li>• Soyez proactif dans la communication</li>
                      <li>• Gérez les réclamations avec professionnalisme</li>
                      <li>• Demandez des avis après livraison</li>
                    </ul>
                  </div>
                </div>
              </GuideSection>

              <GuideSection icon={Star} title="Système de notation">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Critères d'évaluation</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Qualité du produit</li>
                      <li>• Rapidité d'expédition</li>
                      <li>• Communication vendeur</li>
                      <li>• Conformité description</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Impact notation</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 4.5+ : Vendeur recommandé</li>
                      <li>• 4.0-4.4 : Bon vendeur</li>
                      <li>• 3.5-3.9 : Vendeur correct</li>
                      <li>• &lt;3.5 : Amélioration requise</li>
                    </ul>
                  </div>
                </div>
              </GuideSection>
            </TabsContent>

            <TabsContent value="policies" className="space-y-6">
              <GuideSection icon={AlertCircle} title="Politiques et règles">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Produits interdits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Produits illégaux ou dangereux</li>
                      <li>• Contrefaçons ou copies</li>
                      <li>• Médicaments sans autorisation</li>
                      <li>• Armes et munitions</li>
                      <li>• Produits périssables sans licence</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Obligations fiscales</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Déclaration des revenus obligatoire</li>
                      <li>• TVA applicable selon le CA</li>
                      <li>• Factures requises pour B2B</li>
                      <li>• Tenue d'une comptabilité</li>
                    </ul>
                  </div>
                </div>
              </GuideSection>

              <GuideSection icon={CreditCard} title="Paiements et commissions">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Cycle de paiement</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Versement tous les 15 jours</li>
                      <li>• Délai de sécurité : 7 jours après livraison</li>
                      <li>• Virement bancaire ou Mobile Money</li>
                      <li>• Relevé détaillé fourni</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Frais et commissions</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Commission variable selon le plan</li>
                      <li>• Frais de transaction : 2%</li>
                      <li>• Pas de frais d'inscription</li>
                      <li>• Pas de frais de listing</li>
                    </ul>
                  </div>
                </div>
              </GuideSection>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <GuideSection icon={HelpCircle} title="Questions fréquentes">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Comment augmenter mes ventes ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Optimisez vos titres et descriptions, utilisez des photos de qualité, maintenez des prix compétitifs 
                      et offrez un excellent service client. Répondez rapidement aux messages et expédiez rapidement.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Que faire en cas de réclamation ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Écoutez le client, proposez une solution (remboursement, échange, geste commercial). 
                      Contactez le support Gabomazone si nécessaire. La satisfaction client est prioritaire.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Comment obtenir plus d'avis positifs ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Livrez des produits conformes et de qualité, communiquez proactivement avec vos clients, 
                      expédiez rapidement et demandez poliment un avis après une expérience positive.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Puis-je vendre à l'international ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Actuellement, Gabomazone se concentre sur le marché gabonais. L'expansion internationale 
                      est prévue dans les prochains mois. Restez connecté pour les annonces.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Comment contacter le support ?</h4>
                    <p className="text-sm text-muted-foreground">
                      Utilisez la page "Support Vendeur" dans votre tableau de bord, envoyez un email à 
                      support@gabomazone.com ou appelez le +241 XX XX XX XX pour les urgences.
                    </p>
                  </div>
                </div>
              </GuideSection>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}