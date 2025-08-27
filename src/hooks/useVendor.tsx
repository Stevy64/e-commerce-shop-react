import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

/**
 * Hook pour gérer les données vendeur
 * Inspiré des systèmes multivendeur comme Amazon Seller Central
 */

interface VendorData {
  id: string;
  user_id: string;
  business_name: string;
  business_description?: string;
  business_type: string; // Changé pour accepter string depuis la DB
  business_registration_number?: string;
  tax_number?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  status: string; // Changé pour accepter string depuis la DB
  commission_rate: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
}

interface VendorShop {
  id: string;
  vendor_id: string;
  shop_name: string;
  shop_description?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VendorStats {
  total_products: number;
  active_products: number;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
}

export const useVendor = () => {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [shops, setShops] = useState<VendorShop[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Récupère les données du vendeur connecté
   */
  const fetchVendorData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Récupérer les infos vendeur
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (vendorError) throw vendorError;
      
      setVendor(vendorData);

      // Si vendeur existe, récupérer ses boutiques et stats
      if (vendorData) {
        await Promise.all([
          fetchVendorShops(vendorData.id),
          fetchVendorStats(vendorData.id)
        ]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données vendeur:', error);
      toast.error('Erreur lors du chargement des données vendeur');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Récupère les boutiques du vendeur
   */
  const fetchVendorShops = async (vendorId: string) => {
    try {
      const { data, error } = await supabase
        .from('vendor_shops')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShops(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des boutiques:', error);
    }
  };

  /**
   * Récupère les statistiques du vendeur via fonction database
   */
  const fetchVendorStats = async (vendorId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_vendor_stats', { vendor_uuid: vendorId });

      if (error) throw error;
      setStats(data as unknown as VendorStats);
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
    }
  };

  /**
   * Créer un profil vendeur
   * Processus d'inscription comme sur Amazon ou Shopify
   */
  const createVendorProfile = async (vendorData: Partial<VendorData>) => {
    if (!user) {
      toast.error('Vous devez être connecté pour devenir vendeur');
      return false;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vendors')
        .insert([{
          user_id: user.id,
          business_name: vendorData.business_name,
          business_description: vendorData.business_description,
          business_type: vendorData.business_type || 'individual',
          business_registration_number: vendorData.business_registration_number,
          tax_number: vendorData.tax_number,
          phone: vendorData.phone,
          email: vendorData.email || user.email,
          website_url: vendorData.website_url,
          status: 'pending' // Par défaut en attente d'approbation
        }])
        .select()
        .single();

      if (error) throw error;

      setVendor(data);
      toast.success('Demande vendeur soumise avec succès ! Nous examinerons votre candidature sous 48h.');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la création du profil vendeur:', error);
      if (error.code === '23505') {
        toast.error('Vous avez déjà un profil vendeur');
      } else {
        toast.error('Erreur lors de la création du profil vendeur');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre à jour le profil vendeur
   */
  const updateVendorProfile = async (updates: Partial<VendorData>) => {
    if (!vendor) return false;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendor.id)
        .select()
        .single();

      if (error) throw error;

      setVendor(data);
      toast.success('Profil vendeur mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du profil');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Créer une boutique
   */
  const createShop = async (shopData: Partial<VendorShop>) => {
    if (!vendor) return false;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vendor_shops')
        .insert([{
          vendor_id: vendor.id,
          shop_name: shopData.shop_name,
          shop_description: shopData.shop_description,
          address: shopData.address,
          city: shopData.city,
          province: shopData.province,
          postal_code: shopData.postal_code
        }])
        .select()
        .single();

      if (error) throw error;

      setShops(prev => [data, ...prev]);
      toast.success('Boutique créée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la création de la boutique:', error);
      toast.error('Erreur lors de la création de la boutique');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vérifier si l'utilisateur est un vendeur approuvé
   */
  const isApprovedVendor = () => {
    return vendor?.status === 'approved';
  };

  /**
   * Vérifier si l'utilisateur a un profil vendeur (peu importe le statut)
   */
  const hasVendorProfile = () => {
    return !!vendor;
  };

  // Charger les données au montage et changement d'utilisateur
  useEffect(() => {
    if (user) {
      fetchVendorData();
    } else {
      setVendor(null);
      setShops([]);
      setStats(null);
    }
  }, [user]);

  return {
    vendor,
    shops,
    stats,
    loading,
    createVendorProfile,
    updateVendorProfile,
    createShop,
    fetchVendorData,
    isApprovedVendor,
    hasVendorProfile
  };
};