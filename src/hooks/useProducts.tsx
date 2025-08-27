import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useVendor } from "./useVendor";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  discount?: number;
  image_url?: string;
  stock_quantity: number;
  weight?: number;
  dimensions?: any;
  status: string;
  sku?: string;
  vendor_id: string;
  shop_id?: string;
  is_new: boolean;
  shipping_info?: any;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  discount?: number;
  stock_quantity: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  status: 'draft' | 'active' | 'inactive';
  image_url?: string;
  is_new?: boolean;
  shipping_info?: {
    weight_unit?: string;
    dimension_unit?: string;
    shipping_class?: string;
  };
}

export const useProducts = () => {
  const { user } = useAuth();
  const { vendor } = useVendor();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Récupérer tous les produits du vendeur
  const fetchVendorProducts = async () => {
    if (!vendor) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau produit
  const createProduct = async (productData: ProductFormData) => {
    if (!vendor) {
      toast.error('Vous devez être un vendeur approuvé');
      return false;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          vendor_id: vendor.id,
          shop_id: null, // Will be set when vendor has shops
        }])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data, ...prev]);
      toast.success('Produit créé avec succès');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la création du produit:', error);
      toast.error('Erreur lors de la création du produit');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un produit
  const updateProduct = async (productId: string, updates: Partial<ProductFormData>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(product => 
        product.id === productId ? data : product
      ));
      toast.success('Produit mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du produit');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un produit
  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== productId));
      toast.success('Produit supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du produit');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un produit par ID
  const getProduct = async (productId: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      return null;
    }
  };

  // Charger les produits au montage et changement de vendeur
  useEffect(() => {
    if (vendor) {
      fetchVendorProducts();
    } else {
      setProducts([]);
    }
  }, [vendor]);

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    refetch: fetchVendorProducts
  };
};