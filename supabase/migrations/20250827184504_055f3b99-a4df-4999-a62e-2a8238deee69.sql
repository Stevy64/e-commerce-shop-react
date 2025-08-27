-- Supprimer d'abord la fonction existante
DROP FUNCTION IF EXISTS public.get_eligible_users_for_super_admin();

-- Recréer la fonction avec la nouvelle signature
CREATE OR REPLACE FUNCTION public.get_eligible_users_for_super_admin()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  is_super_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_user_role TEXT;
BEGIN
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Vérifier si l'utilisateur actuel est super-admin
  SELECT role INTO current_user_role 
  FROM public.user_roles 
  WHERE user_id = current_user_id AND role = 'super_admin';
  
  IF current_user_role IS NULL THEN
    RETURN;
  END IF;

  -- Retourner tous les utilisateurs avec leur statut super-admin
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    COALESCE(p.display_name, au.email) as display_name,
    au.created_at,
    CASE WHEN ur.role = 'super_admin' THEN true ELSE false END as is_super_admin
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.user_id
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id AND ur.role = 'super_admin'
  WHERE au.id != current_user_id
  ORDER BY au.created_at ASC;
END;
$$;