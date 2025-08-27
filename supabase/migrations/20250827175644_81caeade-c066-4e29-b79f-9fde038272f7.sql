-- Créer une fonction pour assigner le super admin au premier utilisateur
CREATE OR REPLACE FUNCTION assign_super_admin_to_first_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Supprimer tous les rôles super_admin existants
  DELETE FROM public.user_roles WHERE role = 'super_admin';
  
  -- Récupérer le premier utilisateur créé
  SELECT id INTO first_user_id 
  FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  -- Assigner le rôle super_admin au premier utilisateur
  IF first_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (first_user_id, 'super_admin', first_user_id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Exécuter la fonction
SELECT assign_super_admin_to_first_user();

-- Supprimer la fonction temporaire
DROP FUNCTION assign_super_admin_to_first_user();