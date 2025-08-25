/**
 * Hook de gestion de la liste de souhaits pour l'API Django
 * 
 * Ce hook remplace useWishlist.tsx et utilise l'API Django au lieu de Supabase.
 * Il maintient la même interface pour assurer la compatibilité.
 */

import { useState, useEffect } from "react";
import { apiService, WishlistItem } from "@/services/api";
import { useAuth } from "./useAuthDjango";
import { useToast } from "@/hooks/use-toast";

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWishlistItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await apiService.getWishlistItems();
      setWishlistItems(items);
    } catch (error) {
      console.error('Erreur lors du chargement de la liste de souhaits:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la liste de souhaits",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des produits à votre liste de souhaits",
      });
      return;
    }

    try {
      await apiService.addToWishlist(productId);
      toast({
        title: "Ajouté aux favoris",
        description: "Le produit a été ajouté à votre liste de souhaits",
      });
      await fetchWishlistItems(); // Recharger la wishlist
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la liste de souhaits:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le produit à la liste de souhaits",
      });
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    try {
      await apiService.removeFromWishlist(wishlistItemId);
      toast({
        title: "Retiré des favoris",
        description: "Le produit a été retiré de votre liste de souhaits",
      });
      await fetchWishlistItems();
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste de souhaits:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer de la liste de souhaits",
      });
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.product.id === productId);
  };

  const getWishlistItemByProductId = (productId: string): WishlistItem | undefined => {
    return wishlistItems.find(item => item.product.id === productId);
  };

  const toggleWishlist = async (productId: string) => {
    const existingItem = getWishlistItemByProductId(productId);
    
    if (existingItem) {
      await removeFromWishlist(existingItem.id);
    } else {
      await addToWishlist(productId);
    }
  };

  const getWishlistCount = (): number => {
    return wishlistItems.length;
  };

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistItemByProductId,
    getWishlistCount,
    refetch: fetchWishlistItems
  };
};

