import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthDjango";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const SignInForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      
      try {
        await signIn(email, password);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Gabomazone !",
        });
        navigate('/');
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: error.message || "Identifiants incorrects",
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="signin-email" className="text-sm font-medium">
            Adresse email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signin-email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signin-password" className="text-sm font-medium">
            Mot de passe
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </form>
    );
  };

  const SignUpForm = () => {
    const [formData, setFormData] = useState({
      username: "",
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (formData.password !== formData.password_confirm) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas",
        });
        return;
      }

      if (formData.password.length < 8) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Le mot de passe doit contenir au moins 8 caractères",
        });
        return;
      }

      setLoading(true);
      
      try {
        await signUp(formData);
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        });
        // Basculer vers l'onglet connexion
        const signinTab = document.querySelector('[value="signin"]') as HTMLElement;
        signinTab?.click();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: error.message || "Une erreur est survenue lors de l'inscription",
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="signup-firstname" className="text-sm font-medium">
              Prénom
            </Label>
            <Input
              id="signup-firstname"
              name="first_name"
              type="text"
              placeholder="Jean"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-lastname" className="text-sm font-medium">
              Nom
            </Label>
            <Input
              id="signup-lastname"
              name="last_name"
              type="text"
              placeholder="Dupont"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-username" className="text-sm font-medium">
            Nom d'utilisateur
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signup-username"
              name="username"
              type="text"
              placeholder="jeandupont"
              value={formData.username}
              onChange={handleChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-sm font-medium">
            Adresse email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="jean@example.com"
              value={formData.email}
              onChange={handleChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-sm font-medium">
            Mot de passe
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 pr-10"
              required
              minLength={8}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password-confirm" className="text-sm font-medium">
            Confirmer le mot de passe
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signup-password-confirm"
              name="password_confirm"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password_confirm}
              onChange={handleChange}
              className="pl-10 pr-10"
              required
              minLength={8}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Inscription en cours..." : "Créer mon compte"}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-background to-muted/20">
        <div className="container">
          <div className="flex justify-center">
            <Card className="w-full max-w-lg shadow-lg">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Gabomazone
                </CardTitle>
                <CardDescription className="text-base">
                  Rejoignez notre communauté et découvrez des produits exceptionnels
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="signin" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 h-12">
                    <TabsTrigger value="signin" className="text-sm font-medium">
                      Connexion
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm font-medium">
                      Inscription
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin" className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">Bon retour !</h3>
                      <p className="text-sm text-muted-foreground">
                        Connectez-vous à votre compte
                      </p>
                    </div>
                    <SignInForm />
                  </TabsContent>
                  <TabsContent value="signup" className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">Créer un compte</h3>
                      <p className="text-sm text-muted-foreground">
                        Rejoignez-nous en quelques clics
                      </p>
                    </div>
                    <SignUpForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Auth;