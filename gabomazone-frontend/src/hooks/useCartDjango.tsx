/**
 * Hook de gestion du panier pour l'API Django
 * 
 * Ce hook remplace useCart.tsx et utilise l'API Django au lieu de Supabase.
 * Il maintient la même interface pour assurer la compatibilité.
 */

import { useState, useEffect } from "react";
import { apiService, CartItem, CartTotal } from "@/services/api";
import { useAuth } from "./useAuthDjango";
import { useToast } from "@/hooks/use-toast";

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await apiService.getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le panier",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des produits au panier",
      });
      return;
    }

    try {
      await apiService.addToCart(productId, quantity);
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté au panier",
      });
      await fetchCartItems();
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter au panier",
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      await apiService.removeFromCart(cartItemId);
      await fetchCartItems();
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer du panier",
      });
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      await apiService.updateCartItem(cartItemId, quantity);
      await fetchCartItems();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité",
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await apiService.clearCart();
      setCartItems([]);
      toast({
        title: "Panier vidé",
        description: "Tous les articles ont été supprimés du panier",
      });
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de vider le panier",
      });
    }
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => {
      return total + item.total_price;
    }, 0);
  };

  const getCartItemsCount = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotalFromAPI = async (): Promise<CartTotal | null> => {
    if (!user) return null;

    try {
      return await apiService.getCartTotal();
    } catch (error) {
      console.error('Erreur lors du calcul du total:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
  }, [user]);

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCartTotalFromAPI,
    refetch: fetchCartItems
  };
};

