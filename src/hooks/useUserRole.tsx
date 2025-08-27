import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isVendor, setIsVendor] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole(null);
      setIsVendor(false);
      setIsSuperAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Vérifier le rôle dans user_roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // Vérifier si l'utilisateur est vendeur
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('status')
        .eq('user_id', user.id)
        .single();

      const role = roleData?.role || 'user';
      setUserRole(role);
      setIsSuperAdmin(role === 'super_admin');
      setIsVendor(vendorData?.status === 'approved');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
      setIsVendor(false);
      setIsSuperAdmin(false);
    }
    setLoading(false);
  };

  return {
    userRole,
    isVendor,
    isSuperAdmin,
    loading,
    refetch: fetchUserRole
  };
};