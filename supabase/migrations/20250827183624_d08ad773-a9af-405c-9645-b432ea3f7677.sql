-- Nettoyer d'abord tous les rôles existants pour éviter les doublons
DELETE FROM public.user_roles WHERE user_id = '4479c2d1-64c3-4ac7-9e2c-d570b226b766';

-- Supprimer tous les super-admins existants
DELETE FROM public.user_roles WHERE role = 'super_admin';

-- Attribuer le rôle super-admin à l'utilisateur connecté
INSERT INTO public.user_roles (user_id, role, assigned_by) 
VALUES ('4479c2d1-64c3-4ac7-9e2c-d570b226b766', 'super_admin', '4479c2d1-64c3-4ac7-9e2c-d570b226b766');

-- Créer une fonction plus simple pour s'attribuer le rôle super-admin
CREATE OR REPLACE FUNCTION public.make_me_super_admin()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  result JSON;
BEGIN
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No user logged in');
  END IF;

  -- Supprimer tous les rôles existants de cet utilisateur
  DELETE FROM public.user_roles WHERE user_id = current_user_id;
  
  -- Supprimer tous les super-admins existants
  DELETE FROM public.user_roles WHERE role = 'super_admin';
  
  -- Attribuer le rôle super-admin
  INSERT INTO public.user_roles (user_id, role, assigned_by) 
  VALUES (current_user_id, 'super_admin', current_user_id);
  
  RETURN json_build_object('success', true, 'user_id', current_user_id, 'message', 'Super admin role assigned');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;