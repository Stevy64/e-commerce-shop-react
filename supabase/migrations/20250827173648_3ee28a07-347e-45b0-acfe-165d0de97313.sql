-- First, add 'vendor' to the user_role enum if it doesn't exist
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'vendor';

-- Execute the vendor role synchronization to ensure existing vendors have proper roles
DO $$
DECLARE
    vendor_record RECORD;
BEGIN
    -- Add vendor role for all approved vendors
    FOR vendor_record IN 
        SELECT user_id FROM public.vendors WHERE status = 'approved'
    LOOP
        INSERT INTO public.user_roles (user_id, role)
        VALUES (vendor_record.user_id, 'vendor')
        ON CONFLICT (user_id, role) DO NOTHING;
    END LOOP;
    
    -- Remove vendor role for non-approved vendors
    DELETE FROM public.user_roles ur
    WHERE ur.role = 'vendor'
    AND ur.user_id NOT IN (
        SELECT user_id FROM public.vendors WHERE status = 'approved'
    );
END $$;