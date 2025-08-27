import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useVendor } from "@/hooks/useVendor";
import { useProducts } from "@/hooks/useProducts";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Eye, Package } from "lucide-react";
import { formatPrice as formatCurrency } from "@/utils/currency";

export default function VendorProducts() {
  const { user, loading: authLoading } = useAuth();
  const { vendor, isApprovedVendor } = useVendor();
  const { products, loading, deleteProduct } = useProducts();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Compte en attente d'approbation</h2>
              <p className="text-muted-foreground">
                Votre demande vendeur est en cours d'examen. Vous pourrez gérer vos produits une fois approuvé.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      draft: "secondary", 
      inactive: "destructive"
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status === 'active' ? 'Actif' : status === 'draft' ? 'Brouillon' : 'Inactif'}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Mes Produits</h1>
              <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
            </div>
            <Button onClick={() => navigate('/vendor/products/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Produit
            </Button>
          </div>

          {/* Filtres et recherche */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-muted-foreground">Total produits</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Actifs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.status === 'draft').length}
                </div>
                <div className="text-sm text-muted-foreground">Brouillons</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock_quantity <= 5).length}
                </div>
                <div className="text-sm text-muted-foreground">Stock faible</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Liste des produits */}
        {loading ? (
          <div className="text-center py-8">Chargement des produits...</div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {products.length === 0 
                  ? "Commencez par ajouter votre premier produit"
                  : "Aucun produit ne correspond à vos critères de recherche"
                }
              </p>
              {products.length === 0 && (
                <Button onClick={() => navigate('/vendor/products/new')}>
                  Ajouter un produit
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{formatCurrency(product.price)}</span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.original_price)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Stock: {product.stock_quantity}</span>
                      {product.stock_quantity <= 5 && (
                        <Badge variant="destructive" className="text-xs">Stock faible</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/vendor/products/edit/${product.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer "{product.title}" ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
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
      </main>

      <Footer />
    </div>
  );
}