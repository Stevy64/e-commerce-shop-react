-- Corriger les politiques RLS pour permettre aux super-admins de voir tous les vendeurs
DROP POLICY IF EXISTS "Super admins can view all vendors" ON vendors;

CREATE POLICY "Super admins can view all vendors" 
ON vendors 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Permettre aux super-admins de gérer tous les vendeurs
DROP POLICY IF EXISTS "Super admins can manage all vendors" ON vendors;

CREATE POLICY "Super admins can manage all vendors" 
ON vendors 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Permettre aux super-admins de voir tous les produits
DROP POLICY IF EXISTS "Super admins can view all products" ON products;

CREATE POLICY "Super admins can view all products" 
ON products 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Permettre aux super-admins de voir toutes les commandes
DROP POLICY IF EXISTS "Super admins can view all orders" ON orders;

CREATE POLICY "Super admins can view all orders" 
ON orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Permettre aux super-admins de voir tous les order_items
DROP POLICY IF EXISTS "Super admins can view all order items" ON order_items;

CREATE POLICY "Super admins can view all order items" 
ON order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- Créer une table pour les actions de suppression de compte
CREATE TABLE IF NOT EXISTS account_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deletion_reason TEXT,
  deleted_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_data JSONB -- Sauvegarder les données avant suppression
);

ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

-- Politique pour les suppressions de compte
CREATE POLICY "Users can request account deletion"
ON account_deletions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all deletions"
ON account_deletions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);