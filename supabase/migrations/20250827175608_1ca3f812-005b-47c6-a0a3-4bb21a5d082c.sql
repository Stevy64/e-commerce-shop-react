-- 1. D'abord, supprimer tous les rôles super_admin existants
DELETE FROM user_roles WHERE role = 'super_admin';

-- 2. Ensuite, assigner le rôle super_admin à l'utilisateur actuel
INSERT INTO user_roles (user_id, role, assigned_by)
VALUES (auth.uid(), 'super_admin', auth.uid())
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Créer un bucket pour les avatars s'il n'existe pas
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Créer les politiques pour le bucket avatars
INSERT INTO storage.policies (name, bucket_id, definition, check_definition) 
VALUES 
  ('Avatars are publicly accessible', 'avatars', 'bucket_id = ''avatars''', NULL),
  ('Users can upload their own avatar', 'avatars', 'bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1]', 'bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1]'),
  ('Users can update their own avatar', 'avatars', 'bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1]', NULL),
  ('Users can delete their own avatar', 'avatars', 'bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1]', NULL)
ON CONFLICT DO NOTHING;