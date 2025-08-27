import { supabase } from "@/integrations/supabase/client";

/**
 * Fonction utilitaire pour attribuer le rôle super_admin à l'utilisateur connecté
 * À utiliser uniquement pour les tests et la configuration initiale
 */
export const assignSuperAdminRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Aucun utilisateur connecté');
    return { success: false, error: 'Aucun utilisateur connecté' };
  }

  try {
    // D'abord, supprimer tout autre super admin existant
    await supabase
      .from('user_roles')
      .delete()
      .eq('role', 'super_admin');

    // Ensuite, attribuer le rôle super_admin à l'utilisateur actuel
    const { error } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: user.id, 
        role: 'super_admin',
        assigned_by: user.id
      });

    if (error) {
      console.error('Erreur lors de l\'attribution du rôle super admin:', error);
      return { success: false, error: error.message };
    }

    console.log('Rôle super admin attribué avec succès à:', user.email);
    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Erreur:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
};

// Exporter aussi l'ancienne fonction pour compatibilité
export const createTestSuperAdmin = assignSuperAdminRole;

// Exécuter automatiquement si on est en développement
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  (window as any).assignSuperAdminRole = assignSuperAdminRole;
  console.log('Pour devenir super admin, tapez: assignSuperAdminRole()');
}