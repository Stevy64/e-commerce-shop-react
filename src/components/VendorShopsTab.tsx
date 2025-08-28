import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Store, Edit, Trash2, MapPin, Globe, Phone, Mail } from "lucide-react";
import { useVendor } from "@/hooks/useVendor";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";

export default function VendorShopsTab() {
  const { shops, createShop, loading } = useVendor();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: "",
    shop_description: "",
    address: "",
    city: "",
    postal_code: "",
    province: "",
    logo_url: "",
    banner_url: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      shop_name: "",
      shop_description: "",
      address: "",
      city: "",
      postal_code: "",
      province: "",
      logo_url: "",
      banner_url: ""
    });
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await createShop(formData);
      toast({
        title: "Boutique créée",
        description: "Votre boutique a été créée avec succès",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la boutique",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditShop = (shop: any) => {
    setEditingShop(shop);
    setFormData({
      shop_name: shop.shop_name || "",
      shop_description: shop.shop_description || "",
      address: shop.address || "",
      city: shop.city || "",
      postal_code: shop.postal_code || "",
      province: shop.province || "",
      logo_url: shop.logo_url || "",
      banner_url: shop.banner_url || ""
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p>Chargement des boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mes Boutiques</h2>
          <p className="text-muted-foreground">Gérez vos boutiques et leurs informations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Boutique
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle boutique</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateShop} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shop_name">Nom de la boutique *</Label>
                  <Input
                    id="shop_name"
                    value={formData.shop_name}
                    onChange={(e) => handleInputChange('shop_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop_description">Description</Label>
                <Textarea
                  id="shop_description"
                  value={formData.shop_description}
                  onChange={(e) => handleInputChange('shop_description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Code postal</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo de la boutique</Label>
                  <ImageUpload
                    currentImageUrl={formData.logo_url}
                    onImageUpload={(url) => handleInputChange('logo_url', url)}
                    bucket="avatars"
                    folder="vendor-logos"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bannière de la boutique</Label>
                  <ImageUpload
                    currentImageUrl={formData.banner_url}
                    onImageUpload={(url) => handleInputChange('banner_url', url)}
                    bucket="avatars"
                    folder="vendor-banners"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? "Création..." : "Créer la boutique"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des boutiques */}
      {shops.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune boutique</h3>
            <p className="text-muted-foreground mb-6">
              Créez votre première boutique pour commencer à vendre
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première boutique
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden">
              {shop.banner_url && (
                <div className="h-32 relative">
                  <img 
                    src={shop.banner_url} 
                    alt={shop.shop_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={shop.is_active ? "default" : "secondary"}>
                      {shop.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {shop.logo_url ? (
                      <img 
                        src={shop.logo_url} 
                        alt={shop.shop_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Store className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{shop.shop_name}</CardTitle>
                      {!shop.banner_url && (
                        <Badge variant={shop.is_active ? "default" : "secondary"} className="mt-1">
                          {shop.is_active ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditShop(shop)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {shop.shop_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {shop.shop_description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  {shop.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{shop.address}</span>
                    </div>
                  )}
                  {shop.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{shop.city}{shop.province && `, ${shop.province}`}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Globe className="h-4 w-4 mr-2" />
                    Voir la boutique
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la boutique</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer "{shop.shop_name}" ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}