import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useVendor } from "@/hooks/useVendor";
import { useProducts } from "@/hooks/useProducts";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Package } from "lucide-react";
import { toast } from "sonner";

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  weight: number | null;
  dimensions: {
    length: number | null;
    width: number | null;
    height: number | null;
  };
  status: 'draft' | 'active' | 'inactive';
  image_url: string;
  is_new: boolean;
  shipping_info: {
    weight_unit: string;
    dimension_unit: string;
    shipping_class: string;
  };
}

export default function VendorProductForm() {
  const { user, loading: authLoading } = useAuth();
  const { vendor, isApprovedVendor } = useVendor();
  const { createProduct, updateProduct, getProduct } = useProducts();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: 0,
    original_price: null,
    stock_quantity: 0,
    weight: null,
    dimensions: {
      length: null,
      width: null,
      height: null
    },
    status: 'draft',
    image_url: "",
    is_new: false,
    shipping_info: {
      weight_unit: 'kg',
      dimension_unit: 'cm',
      shipping_class: 'standard'
    }
  });

  // Charger le produit si on est en mode édition
  useEffect(() => {
    if (isEditing && id) {
      const loadProduct = async () => {
        const product = await getProduct(id);
        if (product) {
          setFormData({
            title: product.title,
            description: product.description || "",
            price: product.price,
            original_price: product.original_price,
            stock_quantity: product.stock_quantity,
            weight: product.weight,
            dimensions: product.dimensions || { length: null, width: null, height: null },
            status: product.status as 'draft' | 'active' | 'inactive',
            image_url: product.image_url || "",
            is_new: product.is_new,
            shipping_info: product.shipping_info || {
              weight_unit: 'kg',
              dimension_unit: 'cm',
              shipping_class: 'standard'
            }
          });
        } else {
          toast.error("Produit non trouvé");
          navigate('/vendor/products');
        }
      };
      loadProduct();
    }
  }, [isEditing, id, getProduct, navigate]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!vendor) {
    return <Navigate to="/become-vendor" replace />;
  }

  if (!isApprovedVendor()) {
    return <Navigate to="/vendor-dashboard" replace />;
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProductFormData] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || formData.price <= 0) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price || undefined,
        stock_quantity: formData.stock_quantity,
        weight: formData.weight || undefined,
        dimensions: Object.values(formData.dimensions).some(v => v !== null) ? formData.dimensions : undefined,
        status: formData.status,
        image_url: formData.image_url,
        is_new: formData.is_new,
        shipping_info: formData.shipping_info
      };

      const success = isEditing 
        ? await updateProduct(id!, productData)
        : await createProduct(productData);

      if (success) {
        navigate('/vendor/products');
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (formData.original_price && formData.price < formData.original_price) {
      return Math.round(((formData.original_price - formData.price) / formData.original_price) * 100);
    }
    return 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/vendor/products')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux produits
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-8 w-8" />
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Modifier le produit' : 'Nouveau Produit'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {isEditing ? 'Modifiez les informations de votre produit' : 'Ajoutez un nouveau produit à votre catalogue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Nom du produit *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Nom de votre produit"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez votre produit..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">URL de l'image</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(checked) => handleInputChange('is_new', checked)}
                  />
                  <Label htmlFor="is_new">Marquer comme nouveau produit</Label>
                </div>
              </CardContent>
            </Card>

            {/* Prix et stock */}
            <Card>
              <CardHeader>
                <CardTitle>Prix et inventaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix de vente (FCFA) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="original_price">Prix original (FCFA)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={formData.original_price || ''}
                      onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || null)}
                      min="0"
                      step="0.01"
                    />
                    {calculateDiscount() > 0 && (
                      <p className="text-sm text-green-600">Remise: {calculateDiscount()}%</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Quantité en stock *</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expédition */}
            <Card>
              <CardHeader>
                <CardTitle>Informations d'expédition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Poids</Label>
                    <div className="flex gap-2">
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight || ''}
                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || null)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <Select 
                        value={formData.shipping_info.weight_unit} 
                        onValueChange={(value) => handleInputChange('shipping_info.weight_unit', value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Classe d'expédition</Label>
                    <Select 
                      value={formData.shipping_info.shipping_class} 
                      onValueChange={(value) => handleInputChange('shipping_info.shipping_class', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="fragile">Fragile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dimensions</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      value={formData.dimensions.length || ''}
                      onChange={(e) => handleInputChange('dimensions.length', parseFloat(e.target.value) || null)}
                      placeholder="Longueur"
                      min="0"
                      step="0.01"
                    />
                    <Input
                      type="number"
                      value={formData.dimensions.width || ''}
                      onChange={(e) => handleInputChange('dimensions.width', parseFloat(e.target.value) || null)}
                      placeholder="Largeur"
                      min="0"
                      step="0.01"
                    />
                    <Input
                      type="number"
                      value={formData.dimensions.height || ''}
                      onChange={(e) => handleInputChange('dimensions.height', parseFloat(e.target.value) || null)}
                      placeholder="Hauteur"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Unité: {formData.shipping_info.dimension_unit}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'Sauvegarde...' : isEditing ? 'Mettre à jour' : 'Créer le produit'}
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
        </div>
      </main>

      <Footer />
    </div>
  );
}