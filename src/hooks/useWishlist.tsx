import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

interface WishlistItem {
  id: string;
  product_id: string;
  products: {
    id: string;
    title: string;
    price: number;
    original_price?: number;
    discount?: number;
    image_url: string;
  };
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWishlistItems = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product_id,
        products (
          id,
          title,
          price,
          original_price,
          discount,
          image_url
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger la liste de souhaits",
      });
    } else {
      // Filter out items with null products
      const validItems = (data || []).filter(item => item.products !== null);
      setWishlistItems(validItems);
    }
    setLoading(false);
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

    const { error } = await supabase
      .from('wishlist_items')
      .insert({ 
        user_id: user.id, 
        product_id: productId
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "Déjà ajouté",
          description: "Ce produit est déjà dans votre liste de souhaits",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter à la liste de souhaits",
        });
      }
    } else {
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté à votre liste de souhaits",
      });
      fetchWishlistItems();
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', wishlistItemId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer de la liste de souhaits",
      });
    } else {
      fetchWishlistItems();
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const getWishlistItemByProductId = (productId: string) => {
    return wishlistItems.find(item => item.product_id === productId);
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
    isInWishlist,
    getWishlistItemByProductId,
    refetch: fetchWishlistItems
  };
};