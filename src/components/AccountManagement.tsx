import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AccountManagementProps {
  isVendor?: boolean;
}

export const AccountManagement = ({ isVendor = false }: AccountManagementProps) => {
  const [deletionReason, setDeletionReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Sauvegarder les données utilisateur avant suppression
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: vendorData } = isVendor ? await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single() : { data: null };

      // Enregistrer la demande de suppression
      await supabase
        .from('account_deletions')
        .insert({
          user_id: user.id,
          deletion_reason: deletionReason,
          user_data: {
            profile,
            vendor: vendorData,
            account_type: isVendor ? 'vendor' : 'customer'
          }
        });

      // Supprimer les données utilisateur
      if (isVendor && vendorData) {
        // Supprimer d'abord les produits du vendeur
        await supabase
          .from('products')
          .delete()
          .eq('vendor_id', vendorData.id);

        // Supprimer le profil vendeur
        await supabase
          .from('vendors')
          .delete()
          .eq('user_id', user.id);
      }

      // Supprimer le profil utilisateur
      await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      // Déconnecter l'utilisateur
      await signOut();

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès",
      });

      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le compte",
      });
    }
    setIsDeleting(false);
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Zone dangereuse
        </CardTitle>
        <CardDescription>
          Actions irréversibles sur votre compte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="deletion-reason">Raison de la suppression (optionnel)</Label>
          <Textarea
            id="deletion-reason"
            placeholder="Pourquoi souhaitez-vous supprimer votre compte ?"
            value={deletionReason}
            onChange={(e) => setDeletionReason(e.target.value)}
          />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer définitivement mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Cela supprimera définitivement votre compte
                {isVendor ? ", tous vos produits, commandes" : ""} et toutes vos données de nos serveurs.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Suppression..." : "Oui, supprimer définitivement"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};