import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVendor } from "@/hooks/useVendor";
import { useToast } from "@/hooks/use-toast";
import { AccountManagement } from "./AccountManagement";

const businessTypes = [
  { value: "individual", label: "Particulier" },
  { value: "company", label: "Entreprise" },
  { value: "association", label: "Association" }
];

export default function VendorProfileForm() {
  const { user } = useAuth();
  const { vendor, updateVendorProfile } = useVendor();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_description: "",
    business_type: "individual",
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
        business_description: vendor.business_description || "",
        business_type: vendor.business_type || "individual",
        business_registration_number: vendor.business_registration_number || "",
        tax_number: vendor.tax_number || "",
        phone: vendor.phone || "",
        email: vendor.email || "",
        website_url: vendor.website_url || ""
      });
    }
  }, [vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateVendorProfile(formData);
      toast({
        title: "Succès",
        description: "Profil vendeur mis à jour avec succès"
      });
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil vendeur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Informations Vendeur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_name">Nom de l'entreprise *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="Nom de votre entreprise"
                required
              />
            </div>
            <div>
              <Label htmlFor="business_type">Type d'entreprise</Label>
              <Select 
                value={formData.business_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
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

          <div>
            <Label htmlFor="business_description">Description de l'entreprise</Label>
            <Textarea
              id="business_description"
              value={formData.business_description}
              onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))}
              placeholder="Décrivez votre entreprise et vos activités"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_registration_number">Numéro d'enregistrement</Label>
              <Input
                id="business_registration_number"
                value={formData.business_registration_number}
                onChange={(e) => setFormData(prev => ({ ...prev, business_registration_number: e.target.value }))}
                placeholder="Numéro RCCM ou équivalent"
              />
            </div>
            <div>
              <Label htmlFor="tax_number">Numéro fiscal</Label>
              <Input
                id="tax_number"
                value={formData.tax_number}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_number: e.target.value }))}
                placeholder="Numéro d'identification fiscale"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Téléphone professionnel</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+241 XX XX XX XX"
              />
            </div>
            <div>
              <Label htmlFor="email">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@entreprise.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website_url">Site web</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://votre-site.com"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </form>
      </CardContent>
    </Card>

    <AccountManagement isVendor={true} />
  </div>
  );
}