-- Modifier la fonction pour permettre l'attribution à n'importe qui mais limiter à 2 super-admins maximum
CREATE OR REPLACE FUNCTION public.assign_super_admin_to_user(target_user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_user_role TEXT;
  current_super_admin_count INTEGER;
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

  -- Vérifier si l'utilisateur cible existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Target user not found');
  END IF;
  
  -- Vérifier si l'utilisateur cible a déjà le rôle super-admin
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'super_admin') THEN
    RETURN json_build_object('success', false, 'error', 'User is already a super admin');
  END IF;

  -- Compter le nombre actuel de super-admins
  SELECT COUNT(*) INTO current_super_admin_count 
  FROM public.user_roles 
  WHERE role = 'super_admin';
  
  -- Limiter à 2 super-admins maximum
  IF current_super_admin_count >= 2 THEN
    RETURN json_build_object('success', false, 'error', 'Maximum of 2 super admins allowed');
  END IF;
  
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

-- Modifier la fonction pour lister tous les utilisateurs (sans restriction d'ancienneté)
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

-- Créer une fonction pour révoquer le rôle super-admin
CREATE OR REPLACE FUNCTION public.revoke_super_admin_from_user(target_user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_user_role TEXT;
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
    RETURN json_build_object('success', false, 'error', 'Only super admins can revoke super admin role');
  END IF;

  -- Empêcher un super-admin de se révoquer lui-même
  IF target_user_id = current_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot revoke your own super admin role');
  END IF;

  -- Vérifier si l'utilisateur cible a le rôle super-admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'super_admin') THEN
    RETURN json_build_object('success', false, 'error', 'User is not a super admin');
  END IF;
  
  -- Révoquer le rôle super-admin
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role = 'super_admin';
  
  RETURN json_build_object(
    'success', true, 
    'user_id', target_user_id, 
    'revoked_by', current_user_id,
    'message', 'Super admin role revoked successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;