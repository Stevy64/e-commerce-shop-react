import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "./ImageUpload";
import { AccountManagement } from "./AccountManagement";

const gabonProvinces = {
  "Estuaire": ["Libreville", "Owendo", "Akanda", "Ntoum"],
  "Haut-Ogooué": ["Franceville", "Moanda", "Bongoville", "Lékédi"],
  "Moyen-Ogooué": ["Lambaréné", "Ndjolé", "Sindara"],
  "Ngounié": ["Mouila", "Ndendé", "Fougamou", "Lebamba"],
  "Nyanga": ["Tchibanga", "Mayumba", "Moulengui-Binza"],
  "Ogooué-Ivindo": ["Makokou", "Ovan", "Booué", "Mékambo"],
  "Ogooué-Lolo": ["Koulamoutou", "Lastoursville", "Pana"],
  "Ogooué-Maritime": ["Port-Gentil", "Omboué", "Gamba"],
  "Woleu-Ntem": ["Oyem", "Bitam", "Mitzic", "Minvoul"]
};

interface ProfileData {
  display_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  avatar_url: string;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    display_name: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    province: "",
    city: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          address: data.address || "",
          province: data.province || "",
          city: data.city || "",
          avatar_url: data.avatar_url || ""
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profile
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setProfile(prev => ({ ...prev, avatar_url: url }));
  };

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Informations Personnelles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 max-w-md">
            <ImageUpload
              currentImageUrl={profile.avatar_url}
              onImageUpload={handleImageUpload}
              bucket="avatars"
              folder="profile"
              maxSizeMB={2}
              acceptedFormats={["image/png", "image/jpeg", "image/jpg"]}
              label="Photo de profil"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">Prénom</Label>
            <Input
              id="first_name"
              value={profile.first_name}
              onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
              placeholder="Votre prénom"
            />
          </div>
          <div>
            <Label htmlFor="last_name">Nom</Label>
            <Input
              id="last_name"
              value={profile.last_name}
              onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
              placeholder="Votre nom"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="display_name">Nom d'affichage</Label>
          <Input
            id="display_name"
            value={profile.display_name}
            onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
            placeholder="Nom d'affichage"
          />
        </div>

        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={profile.phone}
            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+241 XX XX XX XX"
          />
        </div>

        <div>
          <Label htmlFor="address">Adresse complète</Label>
          <Input
            id="address"
            value={profile.address}
            onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Votre adresse complète"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="province">Province</Label>
            <Select 
              value={profile.province} 
              onValueChange={(value) => setProfile(prev => ({ ...prev, province: value, city: "" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une province" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(gabonProvinces).map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="city">Ville</Label>
            <Select 
              value={profile.city} 
              onValueChange={(value) => setProfile(prev => ({ ...prev, city: value }))}
              disabled={!profile.province}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                {profile.province && gabonProvinces[profile.province as keyof typeof gabonProvinces]?.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </CardContent>
    </Card>

    <AccountManagement />
    </div>
  );
};

export default ProfileSettings;