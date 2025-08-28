import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Building, Mail, Phone, Globe, Hash, FileText, Save, Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVendor } from "@/hooks/useVendor";
import { useToast } from "@/hooks/use-toast";
import { AccountManagement } from "@/components/AccountManagement";

const businessTypes = [
  { value: "individual", label: "Individuel" },
  { value: "company", label: "Entreprise" },
  { value: "association", label: "Association" }
];

export default function VendorProfileTab() {
  const { user } = useAuth();
  const { vendor, updateVendorProfile, loading: vendorLoading } = useVendor();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "individual",
    business_description: "",
    business_registration_number: "",
    tax_number: "",
    phone: "",
    email: "",
    website_url: ""
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        business_name: vendor.business_name || "",
        business_type: vendor.business_type || "individual",
        business_description: vendor.business_description || "",
        business_registration_number: vendor.business_registration_number || "",
        tax_number: vendor.tax_number || "",
        phone: vendor.phone || "",
        email: vendor.email || "",
        website_url: vendor.website_url || ""
      });
    }
  }, [vendor]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateVendorProfile(formData);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (vendor?.status) {
      case 'approved':
        return {
          variant: 'default' as const,
          text: 'Compte approuvé',
          description: 'Votre compte vendeur est actif'
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          text: 'En attente d\'approbation',
          description: 'Nous examinons votre demande'
        };
      case 'rejected':
        return {
          variant: 'destructive' as const,
          text: 'Demande rejetée',
          description: 'Contactez le support'
        };
      default:
        return {
          variant: 'secondary' as const,
          text: 'Statut inconnu',
          description: 'Contactez le support'
        };
    }
  };

  const getPlanInfo = () => {
    const plan = (vendor as any)?.plan;
    switch (plan) {
      case 'golden':
        return { variant: 'default' as const, text: 'Plan Golden', color: 'text-yellow-600' };
      case 'premium':
        return { variant: 'secondary' as const, text: 'Plan Premium', color: 'text-purple-600' };
      case 'basic':
        return { variant: 'outline' as const, text: 'Plan Basic', color: 'text-blue-600' };
      default:
        return { variant: 'outline' as const, text: 'Plan Basic', color: 'text-blue-600' };
    }
  };

  const statusInfo = getStatusInfo();
  const planInfo = getPlanInfo();

  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statut */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Profil Vendeur</h2>
          <p className="text-muted-foreground">Gérez vos informations professionnelles</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
          <Badge variant={planInfo.variant} className={planInfo.color}>{planInfo.text}</Badge>
        </div>
      </div>

      {/* Informations du compte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistiques du vendeur */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Ventes totales:</span>
              <span className="font-bold">{((vendor as any)?.total_sales || 0).toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Commandes:</span>
              <span className="font-bold">{(vendor as any)?.total_orders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Performance:</span>
              <span className="font-bold">{(vendor as any)?.performance_score || 0}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Commission:</span>
              <span className="font-bold">{vendor?.commission_rate || 10}%</span>
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
          </CardContent>
        </Card>

        {/* Formulaire d'édition */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations professionnelles
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Annuler' : 'Modifier'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Nom de l'entreprise *</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_type">Type d'entreprise</Label>
                    <Select 
                      value={formData.business_type} 
                      onValueChange={(value) => handleInputChange('business_type', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_description">Description de l'entreprise</Label>
                  <Textarea
                    id="business_description"
                    value={formData.business_description}
                    onChange={(e) => handleInputChange('business_description', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_registration_number">Numéro d'enregistrement</Label>
                    <Input
                      id="business_registration_number"
                      value={formData.business_registration_number}
                      onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_number">Numéro fiscal</Label>
                    <Input
                      id="tax_number"
                      value={formData.tax_number}
                      onChange={(e) => handleInputChange('tax_number', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Informations de contact
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email professionnel</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_url">Site web</Label>
                    <Input
                      id="website_url"
                      value={formData.website_url}
                      onChange={(e) => handleInputChange('website_url', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gestion du compte */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountManagement isVendor={true} />
        </CardContent>
      </Card>
    </div>
  );
}