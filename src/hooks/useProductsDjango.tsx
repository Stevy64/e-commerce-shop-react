/**
 * Hook de gestion des produits pour l'API Django
 * 
 * Ce hook utilise l'API Django pour récupérer les produits
 * et remplace les appels Supabase existants.
 */

import { useState, useEffect } from "react";
import { apiService, Product } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await apiService.getProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les produits",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const featured = await apiService.getFeaturedProducts();
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Erreur lors du chargement des produits mis en avant:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les produits mis en avant",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    try {
      return await apiService.getProduct(id);
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le produit",
      });
      return null;
    }
  };

  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) return products;
    
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.title.toLowerCase().includes(lowercaseQuery) ||
      (product.description && product.description.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getProductsByCategory = (isNew?: boolean): Product[] => {
    if (isNew === undefined) return products;
    return products.filter(product => product.is_new === isNew);
  };

  const getProductsWithDiscount = (): Product[] => {
    return products.filter(product => product.discount && product.discount > 0);
  };

  const sortProducts = (sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest'): Product[] => {
    const sortedProducts = [...products];
    
    switch (sortBy) {
      case 'price_asc':
        return sortedProducts.sort((a, b) => a.effective_price - b.effective_price);
      case 'price_desc':
        return sortedProducts.sort((a, b) => b.effective_price - a.effective_price);
      case 'name_asc':
        return sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
      case 'name_desc':
        return sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
      case 'newest':
        return sortedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return sortedProducts;
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
  }, []);

  return {
    products,
    featuredProducts,
    loading,
    fetchProducts,
    fetchFeaturedProducts,
    getProduct,
    searchProducts,
    getProductsByCategory,
    getProductsWithDiscount,
    sortProducts,
    refetch: fetchProducts
  };
};

