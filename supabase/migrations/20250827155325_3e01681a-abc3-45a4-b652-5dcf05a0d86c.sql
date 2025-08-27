-- Créer le premier super admin
-- Cette migration permet de créer un super admin qui pourra ensuite gérer tous les utilisateurs
INSERT INTO user_roles (user_id, role) 
VALUES ('00000000-0000-0000-0000-000000000000', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger pour s'assurer qu'il n'y a qu'un seul super admin à la fois
CREATE OR REPLACE FUNCTION prevent_multiple_super_admins()
RETURNS TRIGGER AS $$
BEGIN
  -- Si on essaie de créer un nouveau super admin
  IF NEW.role = 'super_admin' THEN
    -- Vérifier s'il existe déjà un super admin
    IF EXISTS (
      SELECT 1 FROM user_roles 
      WHERE role = 'super_admin' 
      AND user_id != NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Il ne peut y avoir qu''un seul super administrateur à la fois';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS enforce_single_super_admin ON user_roles;
CREATE TRIGGER enforce_single_super_admin
  BEFORE INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_super_admins();