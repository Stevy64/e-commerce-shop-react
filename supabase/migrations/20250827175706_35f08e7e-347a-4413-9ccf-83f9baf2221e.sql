-- Ajouter table pour la communication vendeur/client et ajouter colonnes manquantes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_id uuid;

-- Créer une table pour les conversations entre vendeurs et clients
CREATE TABLE IF NOT EXISTS order_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Activer RLS sur la table des conversations
ALTER TABLE order_conversations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les conversations de commandes
CREATE POLICY "Vendors can view conversations for their orders" 
ON order_conversations 
FOR SELECT 
USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Customers can view their order conversations" 
ON order_conversations 
FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Vendors can create conversations for their orders" 
ON order_conversations 
FOR INSERT 
WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create conversations for their orders" 
ON order_conversations 
FOR INSERT 
WITH CHECK (customer_id = auth.uid());

-- Ajouter fonction pour mettre à jour orders.vendor_id automatiquement
CREATE OR REPLACE FUNCTION update_order_vendor_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le vendor_id de la commande basé sur le premier produit
  UPDATE orders 
  SET vendor_id = (
    SELECT p.vendor_id 
    FROM products p 
    WHERE p.id = NEW.product_id 
    LIMIT 1
  )
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour vendor_id automatiquement
CREATE TRIGGER update_order_vendor_trigger
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_vendor_id();

-- Mettre à jour les commandes existantes avec vendor_id
UPDATE orders 
SET vendor_id = (
  SELECT p.vendor_id 
  FROM order_items oi 
  JOIN products p ON oi.product_id = p.id 
  WHERE oi.order_id = orders.id 
  LIMIT 1
)
WHERE vendor_id IS NULL;