import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useProducts, ProductFormData } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, ArrowLeft, Package } from "lucide-react";

export default function VendorProductForm() {
  const { user, loading: authLoading } = useAuth();
  const { isVendor, loading: roleLoading } = useUserRole();
  const { createProduct, updateProduct, getProduct } = useProducts();
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEdit = !!productId;

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: 0,
    original_price: 0,
    discount: 0,
    stock_quantity: 0,
    image_url: "",
    status: "draft"
  });
  const [loading, setLoading] = useState(false);

  // Charger le produit à éditer
  useEffect(() => {
    if (isEdit && productId) {
      loadProduct();
    }
  }, [productId, isEdit]);

  const loadProduct = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const product = await getProduct(productId);
      if (product) {
        setFormData({
          title: product.title,
          description: product.description || "",
          price: product.price,
          original_price: product.original_price || 0,
          discount: product.discount || 0,
          stock_quantity: product.stock_quantity || 0,
          image_url: product.image_url || "",
          status: product.status as "draft" | "active" | "inactive"
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      toast.error('Erreur lors du chargement du produit');
      navigate('/vendor/products');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || roleLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isVendor) {
    return <Navigate to="/become-vendor" replace />;
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Le prix doit être supérieur à 0');
      return;
    }

    setLoading(true);
    
    try {
      if (isEdit && productId) {
        await updateProduct(productId, formData);
        toast.success('Produit mis à jour avec succès');
      } else {
        await createProduct(formData);
        toast.success('Produit créé avec succès');
      }
      navigate('/vendor/products');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/vendor/products')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux produits
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">
                {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
              </h1>
              <p className="text-muted-foreground">
                {isEdit ? 'Modifiez les informations de votre produit' : 'Ajoutez un nouveau produit à votre catalogue'}
              </p>
            </div>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Informations du produit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du produit *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nom de votre produit"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez votre produit en détail..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (FCFA) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Prix original (FCFA)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Remise (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.image_url} 
                      alt="Aperçu" 
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "draft" | "active" | "inactive") => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.status === 'draft' && 'Le produit ne sera pas visible sur le site'}
                  {formData.status === 'active' && 'Le produit sera visible et achetable'}
                  {formData.status === 'inactive' && 'Le produit sera visible mais non achetable'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Sauvegarde...' : (isEdit ? 'Mettre à jour' : 'Créer le produit')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/vendor/products')}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}