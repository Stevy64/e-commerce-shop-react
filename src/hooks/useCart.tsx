import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    title: string;
    price: number;
    image_url: string;
  };
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        products (
          id,
          title,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le panier",
      });
    } else {
      // Filter out items with null products
      const validItems = (data || []).filter(item => item.products !== null);
      setCartItems(validItems);
    }
    setLoading(false);
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

    const { error } = await supabase
      .from('cart_items')
      .upsert({ 
        user_id: user.id, 
        product_id: productId, 
        quantity 
      }, {
        onConflict: 'user_id,product_id'
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter au panier",
      });
    } else {
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté au panier",
      });
      fetchCartItems();
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer du panier",
      });
    } else {
      fetchCartItems();
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité",
      });
    } else {
      fetchCartItems();
    }
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de vider le panier",
      });
    } else {
      setCartItems([]);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item.products) return total;
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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
    refetch: fetchCartItems
  };
};