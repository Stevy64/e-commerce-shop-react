-- Ajouter un système de rôles et admin
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'super_admin');

-- Table des rôles utilisateur
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Plans d'abonnement vendeurs
CREATE TYPE public.vendor_plan AS ENUM ('basic', 'premium', 'golden');

-- Ajouter colonnes pour la gamification et les plans
ALTER TABLE public.vendors 
ADD COLUMN plan vendor_plan DEFAULT 'basic',
ADD COLUMN total_sales NUMERIC DEFAULT 0,
ADD COLUMN total_orders INTEGER DEFAULT 0,
ADD COLUMN performance_score INTEGER DEFAULT 0,
ADD COLUMN badges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN last_plan_update TIMESTAMP WITH TIME ZONE,
ADD COLUMN plan_history JSONB DEFAULT '[]'::jsonb;

-- Table des statistiques détaillées pour les vendeurs
CREATE TABLE public.vendor_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  daily_sales NUMERIC DEFAULT 0,
  daily_orders INTEGER DEFAULT 0,
  daily_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, date)
);

-- Table des badges et récompenses
CREATE TABLE public.vendor_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  conditions_met JSONB
);

-- Table des commissions personnalisées
CREATE TABLE public.vendor_commission_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  plan vendor_plan NOT NULL,
  commission_rate NUMERIC NOT NULL,
  monthly_fee NUMERIC DEFAULT 0,
  transaction_fee NUMERIC DEFAULT 0,
  max_products INTEGER,
  priority_support BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- RLS pour user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- RLS pour vendor_analytics
ALTER TABLE public.vendor_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their analytics" ON public.vendor_analytics
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM public.vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can view all analytics" ON public.vendor_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

-- RLS pour vendor_badges
ALTER TABLE public.vendor_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view vendor badges" ON public.vendor_badges
  FOR SELECT USING (true);

CREATE POLICY "System can manage badges" ON public.vendor_badges
  FOR ALL USING (true);

-- RLS pour vendor_commission_plans
ALTER TABLE public.vendor_commission_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their commission plans" ON public.vendor_commission_plans
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM public.vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage commission plans" ON public.vendor_commission_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

-- Fonction pour calculer le score de performance
CREATE OR REPLACE FUNCTION public.calculate_vendor_performance(vendor_uuid uuid)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sales_score INTEGER := 0;
  orders_score INTEGER := 0;
  rating_score INTEGER := 0;
  total_score INTEGER := 0;
BEGIN
  -- Score basé sur les ventes (40%)
  SELECT CASE 
    WHEN COALESCE(total_sales, 0) >= 100000 THEN 40
    WHEN COALESCE(total_sales, 0) >= 50000 THEN 30
    WHEN COALESCE(total_sales, 0) >= 10000 THEN 20
    WHEN COALESCE(total_sales, 0) >= 1000 THEN 10
    ELSE 5
  END INTO sales_score
  FROM public.vendors WHERE id = vendor_uuid;
  
  -- Score basé sur le nombre de commandes (30%)
  SELECT CASE 
    WHEN COALESCE(total_orders, 0) >= 500 THEN 30
    WHEN COALESCE(total_orders, 0) >= 100 THEN 25
    WHEN COALESCE(total_orders, 0) >= 50 THEN 20
    WHEN COALESCE(total_orders, 0) >= 10 THEN 15
    ELSE 5
  END INTO orders_score
  FROM public.vendors WHERE id = vendor_uuid;
  
  -- Score basé sur les avis (30%)
  SELECT CASE 
    WHEN AVG(rating) >= 4.5 THEN 30
    WHEN AVG(rating) >= 4.0 THEN 25
    WHEN AVG(rating) >= 3.5 THEN 20
    WHEN AVG(rating) >= 3.0 THEN 15
    ELSE 5
  END INTO rating_score
  FROM public.vendor_reviews WHERE vendor_id = vendor_uuid;
  
  total_score := COALESCE(sales_score, 0) + COALESCE(orders_score, 0) + COALESCE(rating_score, 0);
  
  RETURN total_score;
END;
$$;

-- Fonction pour mettre à jour automatiquement le plan vendeur
CREATE OR REPLACE FUNCTION public.update_vendor_plan(vendor_uuid uuid)
RETURNS vendor_plan
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_sales NUMERIC;
  current_orders INTEGER;
  new_plan vendor_plan;
  current_plan vendor_plan;
BEGIN
  SELECT total_sales, total_orders, plan 
  INTO current_sales, current_orders, current_plan
  FROM public.vendors WHERE id = vendor_uuid;
  
  -- Déterminer le nouveau plan basé sur les performances
  IF current_sales >= 50000 AND current_orders >= 200 THEN
    new_plan := 'golden';
  ELSIF current_sales >= 10000 AND current_orders >= 50 THEN
    new_plan := 'premium';
  ELSE
    new_plan := 'basic';
  END IF;
  
  -- Mettre à jour si changement
  IF new_plan != current_plan THEN
    UPDATE public.vendors 
    SET 
      plan = new_plan,
      last_plan_update = now(),
      plan_history = COALESCE(plan_history, '[]'::jsonb) || jsonb_build_object(
        'from', current_plan,
        'to', new_plan,
        'date', now(),
        'sales_at_change', current_sales,
        'orders_at_change', current_orders
      )
    WHERE id = vendor_uuid;
  END IF;
  
  RETURN new_plan;
END;
$$;

-- Trigger pour mettre à jour les statistiques vendeur
CREATE OR REPLACE FUNCTION public.update_vendor_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les stats du vendeur
  UPDATE public.vendors v
  SET 
    total_sales = (
      SELECT COALESCE(SUM(oi.price * oi.quantity), 0)
      FROM public.order_items oi
      JOIN public.products p ON oi.product_id = p.id
      WHERE p.vendor_id = v.id
    ),
    total_orders = (
      SELECT COUNT(DISTINCT oi.order_id)
      FROM public.order_items oi
      JOIN public.products p ON oi.product_id = p.id
      WHERE p.vendor_id = v.id
    )
  WHERE v.id = (
    SELECT p.vendor_id 
    FROM public.products p 
    WHERE p.id = NEW.product_id
  );
  
  -- Mettre à jour le score de performance
  UPDATE public.vendors v
  SET performance_score = public.calculate_vendor_performance(v.id)
  WHERE v.id = (
    SELECT p.vendor_id 
    FROM public.products p 
    WHERE p.id = NEW.product_id
  );
  
  -- Mettre à jour le plan automatiquement
  PERFORM public.update_vendor_plan((
    SELECT p.vendor_id 
    FROM public.products p 
    WHERE p.id = NEW.product_id
  ));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_stats_trigger
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_vendor_stats();

-- Fonction pour attribuer des badges
CREATE OR REPLACE FUNCTION public.award_vendor_badges(vendor_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vendor_record RECORD;
BEGIN
  SELECT * INTO vendor_record FROM public.vendors WHERE id = vendor_uuid;
  
  -- Badge Première Vente
  IF vendor_record.total_orders >= 1 AND NOT EXISTS (
    SELECT 1 FROM public.vendor_badges 
    WHERE vendor_id = vendor_uuid AND badge_type = 'first_sale'
  ) THEN
    INSERT INTO public.vendor_badges (vendor_id, badge_type, badge_name, description)
    VALUES (vendor_uuid, 'first_sale', 'Première Vente', 'Félicitations pour votre première vente !');
  END IF;
  
  -- Badge Top Vendeur
  IF vendor_record.total_sales >= 10000 AND NOT EXISTS (
    SELECT 1 FROM public.vendor_badges 
    WHERE vendor_id = vendor_uuid AND badge_type = 'top_seller'
  ) THEN
    INSERT INTO public.vendor_badges (vendor_id, badge_type, badge_name, description)
    VALUES (vendor_uuid, 'top_seller', 'Top Vendeur', 'Plus de 10 000 FCFA de ventes !');
  END IF;
  
  -- Badge Vendeur Elite
  IF vendor_record.total_sales >= 100000 AND NOT EXISTS (
    SELECT 1 FROM public.vendor_badges 
    WHERE vendor_id = vendor_uuid AND badge_type = 'elite_seller'
  ) THEN
    INSERT INTO public.vendor_badges (vendor_id, badge_type, badge_name, description)
    VALUES (vendor_uuid, 'elite_seller', 'Vendeur Elite', 'Plus de 100 000 FCFA de ventes !');
  END IF;
END;
$$;