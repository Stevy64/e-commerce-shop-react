-- Modifier la fonction pour permettre à un super-admin d'attribuer le rôle à d'autres
CREATE OR REPLACE FUNCTION public.assign_super_admin_to_user(target_user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_user_role TEXT;
  target_user_created_at TIMESTAMP WITH TIME ZONE;
  current_user_created_at TIMESTAMP WITH TIME ZONE;
  result JSON;
BEGIN
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No user logged in');
  END IF;

  -- Vérifier si l'utilisateur actuel est super-admin
  SELECT role INTO current_user_role 
  FROM public.user_roles 
  WHERE user_id = current_user_id AND role = 'super_admin';
  
  IF current_user_role IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Only super admins can assign super admin role');
  END IF;

  -- Vérifier l'ancienneté : l'utilisateur cible doit être plus ancien
  SELECT created_at INTO target_user_created_at 
  FROM auth.users 
  WHERE id = target_user_id;
  
  SELECT created_at INTO current_user_created_at 
  FROM auth.users 
  WHERE id = current_user_id;
  
  IF target_user_created_at IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Target user not found');
  END IF;
  
  IF target_user_created_at >= current_user_created_at THEN
    RETURN json_build_object('success', false, 'error', 'Can only assign super admin role to users older than yourself');
  END IF;

  -- Supprimer l'ancien rôle super-admin (pour éviter les doublons)
  DELETE FROM public.user_roles WHERE role = 'super_admin';
  
  -- Attribuer le rôle super-admin à l'utilisateur cible
  INSERT INTO public.user_roles (user_id, role, assigned_by) 
  VALUES (target_user_id, 'super_admin', current_user_id);
  
  RETURN json_build_object(
    'success', true, 
    'user_id', target_user_id, 
    'assigned_by', current_user_id,
    'message', 'Super admin role assigned successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Créer une fonction pour lister les utilisateurs éligibles (plus anciens que le super-admin actuel)
CREATE OR REPLACE FUNCTION public.get_eligible_users_for_super_admin()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_user_role TEXT;
  current_user_created_at TIMESTAMP WITH TIME ZONE;
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

  -- Récupérer la date de création de l'utilisateur actuel
  SELECT created_at INTO current_user_created_at 
  FROM auth.users 
  WHERE id = current_user_id;

  -- Retourner tous les utilisateurs plus anciens
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    p.display_name,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.user_id
  WHERE au.created_at < current_user_created_at
    AND au.id != current_user_id
  ORDER BY au.created_at ASC;
END;
$$;