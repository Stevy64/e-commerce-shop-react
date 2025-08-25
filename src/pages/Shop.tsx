import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Grid, List, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Shop = () => {
  const products = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      title: "Alexander roll Arm sofa",
      price: 150.00,
      originalPrice: 170.00,
      discount: 10,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop",
      title: "Brasslegged Armchair",
      price: 150.00,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
      title: "Leather Chair",
      price: 200.00,
      originalPrice: 220.00,
      discount: 10,
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      title: "Chair pillow",
      price: 49.00,
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop",
      title: "Modern Dining Chair",
      price: 120.00,
      originalPrice: 140.00,
      discount: 15,
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
      title: "Vintage Armchair",
      price: 280.00,
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      title: "Contemporary Sofa",
      price: 450.00,
      originalPrice: 500.00,
      discount: 10,
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop",
      title: "Office Chair",
      price: 180.00,
    },
  ];

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
                        <Input placeholder="Rechercher..." className="pl-10" />
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
                    <Input placeholder="Rechercher..." className="pl-10" />
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
                    Affichage 1-{products.length} sur {products.length} résultats
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

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