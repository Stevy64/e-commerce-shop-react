import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, Navigate } from "react-router-dom";

const Account = () => {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "");
  const [email, setEmail] = useState(user?.email || "");

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-muted py-16">
        <div className="container">
          <h1 className="text-5xl font-bold text-foreground mb-4">Mon Compte</h1>
          <p className="text-lg text-muted-foreground">Gérez vos informations personnelles et vos préférences</p>
        </div>
      </section>

      {/* Account Content */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg">
                        {displayName ? displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-foreground">{displayName || "Utilisateur"}</h3>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                  
                  <nav className="space-y-2">
                    <Link to="/account" className="flex items-center space-x-3 px-3 py-2 rounded-md bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                    <Link to="/orders" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted">
                      <Settings className="h-4 w-4" />
                      <span>Mes Commandes</span>
                    </Link>
                    <Link to="/wishlist" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted">
                      <MapPin className="h-4 w-4" />
                      <span>Liste de Souhaits</span>
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted w-full text-left text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Se Déconnecter</span>
                    </button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="profile">Informations Personnelles</TabsTrigger>
                  <TabsTrigger value="security">Sécurité</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Informations Personnelles</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Nom d'affichage</Label>
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                      <Button>Sauvegarder les modifications</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Sécurité</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Changer le mot de passe</h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                              <Input id="currentPassword" type="password" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                              <Input id="newPassword" type="password" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                              <Input id="confirmPassword" type="password" />
                            </div>
                            <Button>Changer le mot de passe</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Account;