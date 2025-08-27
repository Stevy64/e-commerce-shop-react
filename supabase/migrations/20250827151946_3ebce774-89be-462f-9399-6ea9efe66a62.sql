-- Création du système multivendeur pour Gabomazone
-- Tables et fonctionnalités inspirées d'Amazon, Shopify, LeBonCoin

-- 1. Table des vendeurs (informations business)
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_description TEXT,
  business_type TEXT CHECK (business_type IN ('individual', 'company')) DEFAULT 'individual',
  business_registration_number TEXT,
  tax_number TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')) DEFAULT 'pending',
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Commission Gabomazone (%)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- 2. Table des boutiques vendeur (un vendeur peut avoir plusieurs boutiques)
CREATE TABLE public.vendor_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Modification de la table products pour le multivendeur
ALTER TABLE public.products 
ADD COLUMN vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
ADD COLUMN shop_id UUID REFERENCES public.vendor_shops(id) ON DELETE SET NULL,
ADD COLUMN sku TEXT UNIQUE,
ADD COLUMN status TEXT CHECK (status IN ('draft', 'active', 'inactive', 'out_of_stock')) DEFAULT 'draft',
ADD COLUMN stock_quantity INTEGER DEFAULT 0,
ADD COLUMN weight DECIMAL(8,2), -- en kg
ADD COLUMN dimensions JSONB, -- {length, width, height} en cm
ADD COLUMN shipping_info JSONB; -- informations d'expédition

-- 4. Table des catégories de produits
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Table de liaison produits-catégories (many-to-many)
CREATE TABLE public.product_category_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- 6. Table des avis vendeurs
CREATE TABLE public.vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, user_id, order_id)
);

-- 7. Table des notifications vendeur
CREATE TABLE public.vendor_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('order', 'review', 'system', 'payment')) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  data JSONB, -- données additionnelles selon le type
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activation de RLS sur toutes les nouvelles tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les vendeurs
CREATE POLICY "Vendors can view their own data" ON public.vendors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create vendor profile" ON public.vendors
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendors can update their own data" ON public.vendors
  FOR UPDATE USING (user_id = auth.uid());

-- Politiques RLS pour les boutiques vendeur
CREATE POLICY "Vendors can manage their shops" ON public.vendor_shops
  FOR ALL USING (
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Everyone can view active shops" ON public.vendor_shops
  FOR SELECT USING (is_active = true);

-- Politiques RLS pour les catégories (lecture publique, gestion admin)
CREATE POLICY "Everyone can view categories" ON public.product_categories
  FOR SELECT USING (is_active = true);

-- Politiques RLS pour les mappings catégories-produits
CREATE POLICY "Everyone can view category mappings" ON public.product_category_mappings
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their product categories" ON public.product_category_mappings
  FOR ALL USING (
    product_id IN (
      SELECT p.id FROM public.products p
      JOIN public.vendors v ON p.vendor_id = v.id
      WHERE v.user_id = auth.uid()
    )
  );

-- Politiques RLS pour les avis vendeurs
CREATE POLICY "Everyone can view vendor reviews" ON public.vendor_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.vendor_reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON public.vendor_reviews
  FOR UPDATE USING (user_id = auth.uid());

-- Politiques RLS pour les notifications vendeur
CREATE POLICY "Vendors can view their notifications" ON public.vendor_notifications
  FOR SELECT USING (
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Vendors can update their notifications" ON public.vendor_notifications
  FOR UPDATE USING (
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
  );

-- Mise à jour de la politique des produits pour inclure les vendeurs
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT USING (status = 'active' OR status IS NULL);

CREATE POLICY "Vendors can manage their products" ON public.products
  FOR ALL USING (
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
  );

-- Fonctions utilitaires pour les vendeurs

-- Fonction pour obtenir les statistiques vendeur
CREATE OR REPLACE FUNCTION public.get_vendor_stats(vendor_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_products', (SELECT COUNT(*) FROM public.products WHERE vendor_id = vendor_uuid),
    'active_products', (SELECT COUNT(*) FROM public.products WHERE vendor_id = vendor_uuid AND status = 'active'),
    'total_orders', (SELECT COUNT(*) FROM public.order_items oi JOIN public.products p ON oi.product_id = p.id WHERE p.vendor_id = vendor_uuid),
    'total_revenue', (SELECT COALESCE(SUM(oi.price * oi.quantity), 0) FROM public.order_items oi JOIN public.products p ON oi.product_id = p.id WHERE p.vendor_id = vendor_uuid),
    'average_rating', (SELECT COALESCE(AVG(rating), 0) FROM public.vendor_reviews WHERE vendor_id = vendor_uuid)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un SKU automatique
CREATE OR REPLACE FUNCTION public.generate_sku(vendor_uuid UUID, product_title TEXT)
RETURNS TEXT AS $$
DECLARE
  vendor_prefix TEXT;
  title_prefix TEXT;
  counter INTEGER;
  new_sku TEXT;
BEGIN
  -- Récupérer le préfixe vendeur (3 premières lettres du nom business)
  SELECT UPPER(LEFT(REGEXP_REPLACE(business_name, '[^a-zA-Z]', '', 'g'), 3))
  INTO vendor_prefix
  FROM public.vendors 
  WHERE id = vendor_uuid;
  
  -- Créer le préfixe du titre (3 premières lettres)
  title_prefix := UPPER(LEFT(REGEXP_REPLACE(product_title, '[^a-zA-Z]', '', 'g'), 3));
  
  -- Trouver le prochain numéro disponible
  SELECT COALESCE(MAX(CAST(RIGHT(sku, 4) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.products 
  WHERE sku LIKE vendor_prefix || title_prefix || '%';
  
  -- Créer le SKU final
  new_sku := vendor_prefix || title_prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN new_sku;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour auto-générer les SKU
CREATE OR REPLACE FUNCTION public.auto_generate_sku()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := public.generate_sku(NEW.vendor_id, NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_sku_trigger
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_sku();

-- Trigger pour mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_shops_updated_at
  BEFORE UPDATE ON public.vendor_shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertion des catégories par défaut
INSERT INTO public.product_categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Appareils électroniques et gadgets'),
('Fashion', 'fashion', 'Vêtements et accessoires de mode'),
('Home & Garden', 'home-garden', 'Articles pour la maison et le jardin'),
('Sports & Outdoors', 'sports-outdoors', 'Équipements sportifs et de plein air'),
('Books & Media', 'books-media', 'Livres, films et médias'),
('Health & Beauty', 'health-beauty', 'Santé et produits de beauté'),
('Toys & Games', 'toys-games', 'Jouets et jeux pour tous âges'),
('Automotive', 'automotive', 'Pièces et accessoires automobiles');