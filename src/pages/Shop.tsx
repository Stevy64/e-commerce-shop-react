import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Grid, List, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
        setFilteredProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Get search query from URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Update URL without reloading the page
    const newUrl = query.trim() 
      ? `${window.location.pathname}?search=${encodeURIComponent(query.trim())}`
      : window.location.pathname;
    window.history.pushState({}, '', newUrl);
  };

  const categories = [
    "All Categories",
    "Chairs",
    "Sofas",
    "Tables",
    "Storage",
    "Lighting",
    "Accessories"
  ];

  const brands = [
    "IKEA",
    "West Elm",
    "CB2",
    "Article",
    "Wayfair"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-muted py-16">
        <div className="container">
          <h1 className="text-5xl font-bold text-foreground mb-4">Shop</h1>
          <p className="text-lg text-muted-foreground">Discover our complete furniture collection</p>
        </div>
      </section>

      {/* Shop Content */}
      <section className="py-6 sm:py-12">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <div className="space-y-6 pt-6">
                    {/* Mobile Filters Content - Same as desktop sidebar */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Rechercher</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder="Rechercher..." 
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Catégories</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox id={`mobile-${category}`} />
                            <label htmlFor={`mobile-${category}`} className="text-sm cursor-pointer">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Gamme de prix</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input type="number" placeholder="Min" className="w-20" />
                          <span>-</span>
                          <Input type="number" placeholder="Max" className="w-20" />
                        </div>
                        <Button size="sm" className="w-full">Filtrer</Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Marques</h3>
                      <div className="space-y-2">
                        {brands.map((brand) => (
                          <div key={brand} className="flex items-center space-x-2">
                            <Checkbox id={`mobile-${brand}`} />
                            <label htmlFor={`mobile-${brand}`} className="text-sm cursor-pointer">
                              {brand}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar Filters */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="space-y-8">
                {/* Search */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Rechercher</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Rechercher..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Catégories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox id={category} />
                        <label htmlFor={category} className="text-sm cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Gamme de prix</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input type="number" placeholder="Min" className="w-20" />
                      <span>-</span>
                      <Input type="number" placeholder="Max" className="w-20" />
                    </div>
                    <Button size="sm" className="w-full">Filtrer</Button>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Marques</h3>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox id={brand} />
                        <label htmlFor={brand} className="text-sm cursor-pointer">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Affichage 1-{filteredProducts.length} sur {filteredProducts.length} résultats
                    {searchQuery && ` pour "${searchQuery}"`}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
                  <Select defaultValue="default">
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Tri par défaut</SelectItem>
                      <SelectItem value="popularity">Trier par popularité</SelectItem>
                      <SelectItem value="rating">Trier par note</SelectItem>
                      <SelectItem value="date">Trier par nouveauté</SelectItem>
                      <SelectItem value="price">Prix: croissant</SelectItem>
                      <SelectItem value="price-desc">Prix: décroissant</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                      <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                      <List className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-4">
                    {searchQuery ? `Aucun produit trouvé pour "${searchQuery}"` : "Aucun produit disponible"}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleSearch("")}
                    >
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      id={product.id}
                      image={product.image_url}
                      title={product.title}
                      price={product.price}
                      originalPrice={product.original_price}
                      discount={product.discount}
                      isNew={product.is_new}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-center">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">Précédent</Button>
                  <Button variant="outline" size="sm" className="bg-primary text-primary-foreground text-xs sm:text-sm">1</Button>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">2</Button>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">3</Button>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">Suivant</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;