import { Search, Heart, ShoppingCart, User, ChevronDown, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlistItems } = useWishlist();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-accent text-accent-foreground py-2">
        <div className="container flex items-center justify-between text-sm">
          <span className="hidden sm:block">PRENEZ SOIN DE VOTRE SANTÉ 25% DE RÉDUCTION CODE * DOFIXQ3 *</span>
          <span className="sm:hidden text-xs">25% DE RÉDUCTION CODE * DOFIXQ3 *</span>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-accent-foreground hover:text-accent-foreground">
                  <span className="hidden sm:inline">Français</span>
                  <span className="sm:hidden">FR</span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Français</DropdownMenuItem>
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Español</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-accent-foreground hover:text-accent-foreground">
                  FCFA <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>FCFA - Franc CFA</DropdownMenuItem>
                <DropdownMenuItem>EUR - Euro</DropdownMenuItem>
                <DropdownMenuItem>USD - Dollar US</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="hidden sm:inline">Paramètres</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 sm:h-20 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary mr-2"></div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">ADDINA</h1>
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className="px-4 py-2 text-foreground hover:text-primary transition-colors">
                  Accueil
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/about" className="px-4 py-2 text-foreground hover:text-primary transition-colors">
                  À propos
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/shop" className="px-4 py-2 text-foreground hover:text-primary transition-colors">
                  Boutique
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Pages</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px]">
                    <NavigationMenuLink asChild>
                      <Link to="/shop" className="block p-3 hover:bg-accent rounded-md">
                        <div className="text-sm font-medium">Boutique</div>
                        <p className="text-sm text-muted-foreground">Parcourir nos produits</p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/product-details" className="block p-3 hover:bg-accent rounded-md">
                        <div className="text-sm font-medium">Détails Produit</div>
                        <p className="text-sm text-muted-foreground">Voir les informations produit</p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/blog" className="px-4 py-2 text-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/contact" className="px-4 py-2 text-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search - Hidden on mobile */}
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-10 w-48 xl:w-64 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Search icon for mobile/tablet */}
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Icons */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-accent text-xs text-accent-foreground flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {getCartItemsCount() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {getCartItemsCount()}
                  </Badge>
                )}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <Link to="/account">
                      <DropdownMenuItem>Mon Compte</DropdownMenuItem>
                    </Link>
                    <Link to="/orders">
                      <DropdownMenuItem>Commandes</DropdownMenuItem>
                    </Link>
                    <Link to="/wishlist">
                      <DropdownMenuItem>Liste de Souhaits</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Se Déconnecter
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <DropdownMenuItem>S'inscrire</DropdownMenuItem>
                    </Link>
                    <Link to="/auth">
                      <DropdownMenuItem>Se connecter</DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Menu</h2>
                  </div>
                  
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative lg:hidden">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Rechercher..."
                      className="pl-10 rounded-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link to="/" className="block px-4 py-2 text-foreground hover:text-primary transition-colors rounded-md hover:bg-accent">
                      Accueil
                    </Link>
                    <Link to="/about" className="block px-4 py-2 text-foreground hover:text-primary transition-colors rounded-md hover:bg-accent">
                      À propos
                    </Link>
                    <Link to="/shop" className="block px-4 py-2 text-foreground hover:text-primary transition-colors rounded-md hover:bg-accent">
                      Boutique
                    </Link>
                    <Link to="/blog" className="block px-4 py-2 text-foreground hover:text-primary transition-colors rounded-md hover:bg-accent">
                      Blog
                    </Link>
                    <Link to="/contact" className="block px-4 py-2 text-foreground hover:text-primary transition-colors rounded-md hover:bg-accent">
                      Contact
                    </Link>
                  </div>

                  {/* Mobile User Actions */}
                  <div className="border-t pt-4 space-y-2">
                    {user ? (
                      <>
                        <Link to="/account">
                          <Button variant="outline" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            <User className="h-4 w-4 mr-2" />
                            Mon Compte
                          </Button>
                        </Link>
                        <Link to="/wishlist">
                          <Button variant="outline" className="w-full justify-start sm:hidden" onClick={() => setMobileMenuOpen(false)}>
                            <Heart className="h-4 w-4 mr-2" />
                            Liste de souhaits
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Se Déconnecter
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to="/auth">
                          <Button variant="outline" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            <User className="h-4 w-4 mr-2" />
                            S'inscrire
                          </Button>
                        </Link>
                        <Link to="/auth">
                          <Button variant="outline" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            <User className="h-4 w-4 mr-2" />
                            Se connecter
                          </Button>
                        </Link>
                        <Link to="/wishlist">
                          <Button variant="outline" className="w-full justify-start sm:hidden" onClick={() => setMobileMenuOpen(false)}>
                            <Heart className="h-4 w-4 mr-2" />
                            Liste de souhaits ({wishlistItems.length})
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;