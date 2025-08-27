import { supabase } from "@/integrations/supabase/client";

/**
 * Utilitaire pour tester et configurer un Super Admin
 * À utiliser uniquement en développement
 */

export const createTestSuperAdmin = async (userEmail: string) => {
  try {
    // Récupérer l'utilisateur par email
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('Aucun utilisateur connecté');
      return;
    }

    // Ajouter le rôle super_admin
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.user.id,
        role: 'super_admin'
      });

    if (error) {
      console.error('Erreur lors de l\'attribution du rôle:', error);
    } else {
      console.log('Rôle Super Admin attribué avec succès!');
      console.log('Vous pouvez maintenant accéder à /super-admin');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// À exécuter dans la console du navigateur si besoin
// createTestSuperAdmin('votre-email@test.com');