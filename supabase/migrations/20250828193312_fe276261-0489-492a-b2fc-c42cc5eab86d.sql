-- Corriger les politiques RLS pour permettre l'insertion d'order_items
-- lors de la création de commandes

-- Supprimer l'ancienne politique restrictive pour order_items
DROP POLICY IF EXISTS "Users can view order items for their orders" ON order_items;

-- Créer des politiques plus permissives pour order_items
CREATE POLICY "Users can create order items for their orders" 
ON order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view order items for their orders" 
ON order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Super admins can manage all order items" 
ON order_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

CREATE POLICY "Vendors can view order items for their products" 
ON order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN vendors v ON p.vendor_id = v.id
    WHERE p.id = order_items.product_id 
    AND v.user_id = auth.uid()
  )
);

-- Créer une fonction pour notifier les vendeurs lors d'une nouvelle commande
CREATE OR REPLACE FUNCTION notify_vendors_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vendor_record RECORD;
  order_record RECORD;
BEGIN
  -- Récupérer les informations de la commande
  SELECT * INTO order_record FROM orders WHERE id = NEW.order_id;
  
  -- Récupérer le vendeur du produit
  SELECT v.*, p.title as product_title 
  INTO vendor_record 
  FROM vendors v
  JOIN products p ON v.id = p.vendor_id
  WHERE p.id = NEW.product_id;
  
  -- Créer une notification pour le vendeur
  INSERT INTO vendor_notifications (
    vendor_id,
    type,
    title,
    message,
    data
  ) VALUES (
    vendor_record.id,
    'new_order',
    'Nouvelle commande reçue',
    'Vous avez reçu une nouvelle commande pour: ' || vendor_record.product_title,
    jsonb_build_object(
      'order_id', NEW.order_id,
      'product_id', NEW.product_id,
      'quantity', NEW.quantity,
      'price', NEW.price,
      'total_amount', order_record.total_amount
    )
  );
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour notifier les vendeurs
DROP TRIGGER IF EXISTS trigger_notify_vendors_new_order ON order_items;
CREATE TRIGGER trigger_notify_vendors_new_order
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_vendors_new_order();

-- Améliorer la fonction pour mettre à jour les stats vendeur
CREATE OR REPLACE FUNCTION update_vendor_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  vendor_id_var UUID;
  order_status TEXT;
BEGIN
  -- Récupérer le vendor_id et le statut de la commande
  SELECT p.vendor_id, o.status 
  INTO vendor_id_var, order_status
  FROM products p
  JOIN orders o ON o.id = NEW.order_id
  WHERE p.id = NEW.product_id;
  
  -- Mettre à jour les stats du vendeur uniquement pour les commandes confirmées
  IF order_status IN ('confirmed', 'shipped', 'delivered') THEN
    UPDATE vendors v
    SET 
      total_sales = COALESCE(
        (SELECT SUM(oi.price * oi.quantity)
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN orders o ON oi.order_id = o.id
         WHERE p.vendor_id = v.id 
         AND o.status IN ('confirmed', 'shipped', 'delivered')), 0
      ),
      total_orders = COALESCE(
        (SELECT COUNT(DISTINCT oi.order_id)
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN orders o ON oi.order_id = o.id
         WHERE p.vendor_id = v.id 
         AND o.status IN ('confirmed', 'shipped', 'delivered')), 0
      )
    WHERE v.id = vendor_id_var;
    
    -- Mettre à jour le score de performance
    UPDATE vendors v
    SET performance_score = calculate_vendor_performance(v.id)
    WHERE v.id = vendor_id_var;
    
    -- Mettre à jour le plan automatiquement
    PERFORM update_vendor_plan(vendor_id_var);
    
    -- Attribuer des badges automatiquement
    PERFORM award_vendor_badges(vendor_id_var);
  END IF;
  
  RETURN NEW;
END;
$$;