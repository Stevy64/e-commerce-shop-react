import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVendor } from "./useVendor";
import { toast } from "sonner";

interface VendorOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  order_items: VendorOrderItem[];
}

interface VendorOrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    image_url?: string;
    sku?: string;
  };
}

export const useVendorOrders = () => {
  const { vendor } = useVendor();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    total_revenue: 0
  });

  // Récupérer les commandes du vendeur
  const fetchVendorOrders = async () => {
    if (!vendor) return;

    try {
      setLoading(true);
      
      // Récupérer toutes les commandes contenant des produits du vendeur
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            product:products!inner (
              id,
              title,
              image_url,
              sku,
              vendor_id
            )
          ),
          profiles (
            first_name,
            last_name,
            phone,
            address
          )
        `)
        .eq('order_items.product.vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filtrer et formater les commandes
      const vendorOrders = (data || []).map(order => ({
        ...order,
        customer: order.profiles?.[0] || {},
        order_items: order.order_items.filter(item => 
          item.product?.vendor_id === vendor.id
        )
      })).filter(order => order.order_items.length > 0);

      setOrders(vendorOrders);
      
      // Calculer les statistiques
      const totalOrders = vendorOrders.length;
      const pendingOrders = vendorOrders.filter(order => 
        ['pending', 'processing'].includes(order.status)
      ).length;
      const completedOrders = vendorOrders.filter(order => 
        order.status === 'completed'
      ).length;
      const totalRevenue = vendorOrders.reduce((sum, order) => 
        sum + order.order_items.reduce((itemSum, item) => 
          itemSum + (item.price * item.quantity), 0
        ), 0
      );

      setStats({
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        completed_orders: completedOrders,
        total_revenue: totalRevenue
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'une commande (limité aux actions autorisées)
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Seuls certains statuts peuvent être mis à jour par le vendeur
      const allowedStatuses = ['processing', 'shipped', 'completed'];
      if (!allowedStatuses.includes(newStatus)) {
        toast.error('Statut non autorisé');
        return false;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Mettre à jour localement
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast.success('Statut de commande mis à jour');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du statut');
      return false;
    }
  };

  // Récupérer une commande spécifique avec détails complets
  const getOrderDetails = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            product:products (
              id,
              title,
              image_url,
              sku,
              description,
              vendor_id
            )
          ),
          profiles (
            first_name,
            last_name,
            phone,
            address,
            city,
            province
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      return null;
    }
  };

  // Charger les commandes au montage et changement de vendeur
  useEffect(() => {
    if (vendor) {
      fetchVendorOrders();
    } else {
      setOrders([]);
      setStats({
        total_orders: 0,
        pending_orders: 0,
        completed_orders: 0,
        total_revenue: 0
      });
    }
  }, [vendor]);

  return {
    orders,
    stats,
    loading,
    updateOrderStatus,
    getOrderDetails,
    refetch: fetchVendorOrders
  };
};