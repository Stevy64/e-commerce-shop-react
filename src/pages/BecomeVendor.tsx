import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useVendor } from "@/hooks/useVendor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  TrendingUp, 
  Users, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  DollarSign,
  BarChart3,
  Globe
} from "lucide-react";

/**
 * Page d'inscription vendeur inspirée d'Amazon Seller Central
 * Processus d'onboarding complet pour devenir vendeur sur Gabomazone
 */

const BecomeVendor = () => {
  const { user } = useAuth();
  const { vendor, createVendorProfile, loading, hasVendorProfile } = useVendor();
  const navigate = useNavigate();

  // Formulaire d'inscription vendeur
  const [formData, setFormData] = useState({
    business_name: '',
    business_description: '',
    business_type: 'individual' as 'individual' | 'company',
    business_registration_number: '',
    tax_number: '',
    phone: '',
    email: user?.email || '',
    website_url: ''
  });

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const success = await createVendorProfile(formData);
    if (success) {
      navigate('/vendor-dashboard');
    }
  };

  // Gestion des changements de champs
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Si utilisateur pas connecté, afficher message
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Store className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h1 className="text-3xl font-bold mb-4">Connectez-vous pour devenir vendeur</h1>
            <p className="text-muted-foreground mb-8">
              Vous devez avoir un compte pour commencer à vendre sur Gabomazone
            </p>
            <Button onClick={() => navigate('/auth')} size="lg">
              Se connecter <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Si utilisateur a déjà un profil vendeur
  if (hasVendorProfile()) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
            <h1 className="text-3xl font-bold mb-4">Vous êtes déjà inscrit</h1>
            <Badge 
              variant={vendor?.status === 'approved' ? 'default' : 'secondary'}
              className="mb-6"
            >
              Statut: {vendor?.status === 'approved' ? 'Approuvé' : 
                      vendor?.status === 'pending' ? 'En attente' : 
                      vendor?.status}
            </Badge>
            <p className="text-muted-foreground mb-8">
              {vendor?.status === 'approved' 
                ? 'Votre compte vendeur est actif. Accédez à votre tableau de bord.'
                : 'Votre demande est en cours d\'examen. Nous vous contacterons sous 48h.'
              }
            </p>
            <Button onClick={() => navigate('/vendor-dashboard')} size="lg">
              Accéder au tableau de bord <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Devenez vendeur sur Gabomazone</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Rejoignez des milliers de vendeurs qui développent leur business sur la première 
            marketplace du Gabon. Vendez vos produits à des millions d'acheteurs.
          </p>
        </div>

        {/* Avantages vendeur */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Augmentez vos ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Accédez à une base de clients élargie et boostez votre chiffre d'affaires
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Millions d'acheteurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Touchez des clients dans tout le Gabon grâce à notre marketplace
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Paiements sécurisés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Recevez vos paiements en toute sécurité avec notre système de protection
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques de la plateforme */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Pourquoi choisir Gabomazone ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="font-bold text-2xl">10%</p>
                <p className="text-sm text-muted-foreground">Commission seulement</p>
              </div>
              <div>
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="font-bold text-2xl">24h</p>
                <p className="text-sm text-muted-foreground">Paiements rapides</p>
              </div>
              <div>
                <Globe className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="font-bold text-2xl">100%</p>
                <p className="text-sm text-muted-foreground">Couverture Gabon</p>
              </div>
              <div>
                <Users className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="font-bold text-2xl">24/7</p>
                <p className="text-sm text-muted-foreground">Support vendeur</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire d'inscription */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Créer votre compte vendeur</CardTitle>
            <CardDescription>
              Remplissez ce formulaire pour commencer à vendre sur Gabomazone. 
              Toutes les informations seront vérifiées avant l'activation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations business */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informations business</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_name">Nom de votre business *</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="Ex: Boutique Mode Libreville"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_type">Type de business *</Label>
                    <Select 
                      value={formData.business_type} 
                      onValueChange={(value) => handleInputChange('business_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Particulier</SelectItem>
                        <SelectItem value="company">Entreprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="business_description">Description de votre activité</Label>
                  <Textarea
                    id="business_description"
                    value={formData.business_description}
                    onChange={(e) => handleInputChange('business_description', e.target.value)}
                    placeholder="Décrivez votre activité, vos produits, votre expertise..."
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Informations légales */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informations légales (optionnelles)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_registration_number">Numéro RCCM</Label>
                    <Input
                      id="business_registration_number"
                      value={formData.business_registration_number}
                      onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                      placeholder="Ex: GA-LBV-01-2024-B13-..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tax_number">Numéro fiscal</Label>
                    <Input
                      id="tax_number"
                      value={formData.tax_number}
                      onChange={(e) => handleInputChange('tax_number', e.target.value)}
                      placeholder="Votre numéro d'identification fiscale"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informations de contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+241 XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="website_url">Site web (optionnel)</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://votre-site.com"
                  />
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Conditions pour devenir vendeur :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Commission Gabomazone : 10% sur chaque vente</li>
                  <li>• Vérification des documents sous 48h</li>
                  <li>• Respect des politiques de qualité et service client</li>
                  <li>• Paiements effectués sous 7 jours après livraison</li>
                </ul>
              </div>

              {/* Bouton de soumission */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={loading || !formData.business_name}
              >
                {loading ? 'Inscription en cours...' : 'Devenir vendeur sur Gabomazone'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Process d'approbation */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Processus d'approbation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full mx-auto mb-2 flex items-center justify-center font-bold">1</div>
                <h4 className="font-semibold">Soumission</h4>
                <p className="text-sm text-muted-foreground">Remplissez le formulaire</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full mx-auto mb-2 flex items-center justify-center font-bold">2</div>
                <h4 className="font-semibold">Vérification</h4>
                <p className="text-sm text-muted-foreground">Examen sous 48h</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full mx-auto mb-2 flex items-center justify-center font-bold">3</div>
                <h4 className="font-semibold">Activation</h4>
                <p className="text-sm text-muted-foreground">Commencez à vendre</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeVendor;