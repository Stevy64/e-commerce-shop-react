import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook pour gérer les fonctionnalités Super Admin
 * Permet la gestion des utilisateurs, vendeurs, commissions et statistiques globales
 */

interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'admin' | 'super_admin';
  assigned_at: string;
}

interface AdminStats {
  total_users: number;
  total_vendors: number;
  total_orders: number;
  total_revenue: number;
  pending_vendors: number;
  active_vendors: number;
}

interface VendorWithStats {
  id: string;
  business_name: string;
  email: string;
  status: string;
  plan: 'basic' | 'premium' | 'golden';
  commission_rate: number;
  total_sales: number;
  total_orders: number;
  performance_score: number;
  created_at: string;
  user_id: string;
}

export const useAdmin = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    total_users: 0,
    total_vendors: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_vendors: 0,
    active_vendors: 0
  });
  const [vendors, setVendors] = useState<VendorWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Vérifie si l'utilisateur actuel est Super Admin
   */
  const isSuperAdmin = async () => {
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single();

    return !error && data;
  };

  /**
   * Récupère les statistiques globales de la plateforme
   */
  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      // Statistiques des utilisateurs
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Statistiques des vendeurs
      const { count: vendorsCount } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

      const { count: pendingVendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: activeVendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Statistiques des commandes
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Revenus totaux
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setAdminStats({
        total_users: usersCount || 0,
        total_vendors: vendorsCount || 0,
        total_orders: ordersCount || 0,
        total_revenue: totalRevenue,
        pending_vendors: pendingVendors || 0,
        active_vendors: activeVendors || 0
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les statistiques",
      });
    }
    setLoading(false);
  };

  /**
   * Récupère la liste des vendeurs avec leurs statistiques
   */
  const fetchVendors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les vendeurs",
      });
    } else {
      setVendors(data || []);
    }
    setLoading(false);
  };

  /**
   * Approuve un vendeur
   */
  const approveVendor = async (vendorId: string) => {
    const { error } = await supabase
      .from('vendors')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', vendorId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'approuver le vendeur",
      });
    } else {
      toast({
        title: "Vendeur approuvé",
        description: "Le vendeur a été approuvé avec succès",
      });
      fetchVendors();
      fetchAdminStats();
    }
  };

  /**
   * Rejette un vendeur
   */
  const rejectVendor = async (vendorId: string) => {
    const { error } = await supabase
      .from('vendors')
      .update({ status: 'rejected' })
      .eq('id', vendorId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rejeter le vendeur",
      });
    } else {
      toast({
        title: "Vendeur rejeté",
        description: "Le vendeur a été rejeté",
      });
      fetchVendors();
      fetchAdminStats();
    }
  };

  /**
   * Met à jour la commission d'un vendeur
   */
  const updateVendorCommission = async (vendorId: string, commissionRate: number) => {
    const { error } = await supabase
      .from('vendors')
      .update({ commission_rate: commissionRate })
      .eq('id', vendorId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour la commission",
      });
    } else {
      toast({
        title: "Commission mise à jour",
        description: `Commission mise à jour à ${commissionRate}%`,
      });
      fetchVendors();
    }
  };

  /**
   * Met à jour le plan d'un vendeur
   */
  const updateVendorPlan = async (vendorId: string, plan: 'basic' | 'premium' | 'golden') => {
    const { error } = await supabase
      .from('vendors')
      .update({ 
        plan: plan,
        last_plan_update: new Date().toISOString()
      })
      .eq('id', vendorId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le plan",
      });
    } else {
      toast({
        title: "Plan mis à jour",
        description: `Plan changé vers ${plan}`,
      });
      fetchVendors();
    }
  };

  /**
   * Attribue un rôle à un utilisateur
   */
  const assignUserRole = async (userId: string, role: 'user' | 'admin' | 'super_admin') => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userId, 
        role: role,
        assigned_by: user?.id
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'attribuer le rôle",
      });
    } else {
      toast({
        title: "Rôle attribué",
        description: `Rôle ${role} attribué avec succès`,
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdminStats();
      fetchVendors();
    }
  }, [user]);

  return {
    adminStats,
    vendors,
    loading,
    isSuperAdmin,
    approveVendor,
    rejectVendor,
    updateVendorCommission,
    updateVendorPlan,
    assignUserRole,
    fetchAdminStats,
    fetchVendors
  };
};