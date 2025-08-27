-- Fix products visibility and update status from draft to active
UPDATE public.products 
SET status = 'active' 
WHERE status = 'draft' OR status IS NULL;

-- Update RLS policy for products to allow viewing active products without vendor requirement
DROP POLICY IF EXISTS "Everyone can view active products" ON public.products;
CREATE POLICY "Everyone can view active products" 
ON public.products 
FOR SELECT 
USING (status = 'active');

-- Ensure cart_items and wishlist_items can access products table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Fix the infinite recursion in user_roles policies
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.get_current_user_role() = 'super_admin');

-- Create a function to assign super admin role safely
CREATE OR REPLACE FUNCTION public.assign_super_admin_role_safe()
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  result JSON;
BEGIN
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No user logged in');
  END IF;

  -- First, remove any existing super admin role
  DELETE FROM public.user_roles WHERE role = 'super_admin';
  
  -- Then assign super admin role to current user
  INSERT INTO public.user_roles (user_id, role, assigned_by) 
  VALUES (current_user_id, 'super_admin', current_user_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN json_build_object('success', true, 'user_id', current_user_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;