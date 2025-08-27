import { supabase } from "@/integrations/supabase/client";

/**
 * Fonction utilitaire pour attribuer le rôle super_admin à l'utilisateur connecté
 * À utiliser uniquement pour les tests et la configuration initiale
 */
export const assignSuperAdminRole = async () => {
  try {
    const { data, error } = await supabase.rpc('assign_super_admin_role_safe');
    
    if (error) {
      console.error('Erreur lors de l\'attribution du rôle super admin:', error);
      return { success: false, error: error.message };
    }

    const result = data as { success: boolean; user_id?: string; error?: string };
    
    if (result.success) {
      console.log('Rôle super admin attribué avec succès');
      return { success: true, userId: result.user_id };
    } else {
      console.error('Erreur:', result.error);
      return { success: false, error: result.error };
    }
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