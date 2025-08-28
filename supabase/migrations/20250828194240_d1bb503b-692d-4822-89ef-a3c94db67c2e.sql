-- Fix RLS policies for Super Admin to see all vendors and support tickets

-- Drop existing policies for vendors that may block Super Admin
DROP POLICY IF EXISTS "Super admins can view all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Super admins can manage all vendors" ON public.vendors;

-- Create comprehensive Super Admin policies for vendors
CREATE POLICY "Super admins can view all vendors" 
ON public.vendors 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage all vendors" 
ON public.vendors 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Fix support tickets policies
DROP POLICY IF EXISTS "Super admins can view all support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Super admins can manage all support tickets" ON public.support_tickets;

CREATE POLICY "Super admins can view all support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage all support tickets" 
ON public.support_tickets 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Fix vendor_shops policies for Super Admin
DROP POLICY IF EXISTS "Super admins can view all shops" ON public.vendor_shops;

CREATE POLICY "Super admins can view all shops" 
ON public.vendor_shops 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage all shops" 
ON public.vendor_shops 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);