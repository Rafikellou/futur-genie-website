-- ============================================
-- Migration : Synchroniser role vers app_metadata via trigger
-- Date : 16 octobre 2025
-- ============================================
-- 
-- CONTEXTE :
-- Actuellement, le rôle est stocké dans user_metadata (modifiable par l'utilisateur).
-- Il devrait être dans app_metadata (sécurisé, non modifiable).
--
-- PROBLÈME :
-- - user_metadata peut être modifié par l'utilisateur
-- - app_metadata ne peut être modifié que côté serveur (Admin API)
-- - Le signup client ne peut pas définir app_metadata directement
--
-- SOLUTION :
-- Créer un trigger PostgreSQL qui copie automatiquement le rôle
-- de user_metadata vers app_metadata lors de la création d'un user.
--
-- IMPACT :
-- - Le rôle sera disponible dans le JWT (app_metadata.role)
-- - Sécurité améliorée (rôle non modifiable par l'utilisateur)
-- - Compatible avec le flow de signup existant
--
-- ============================================

-- Fonction trigger pour synchroniser le rôle
CREATE OR REPLACE FUNCTION auth.sync_role_to_app_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Récupérer le rôle depuis user_metadata
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Si un rôle est défini dans user_metadata
  IF user_role IS NOT NULL THEN
    -- Copier vers app_metadata
    NEW.raw_app_meta_data := jsonb_set(
      COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(user_role)
    );
    
    RAISE LOG 'Role synced to app_metadata for user %: %', NEW.id, user_role;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_sync_role ON auth.users;

CREATE TRIGGER on_auth_user_created_sync_role
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.sync_role_to_app_metadata();

-- Ajouter un commentaire explicatif
COMMENT ON FUNCTION auth.sync_role_to_app_metadata() IS 
'Trigger function qui copie automatiquement le rôle de user_metadata vers app_metadata.
Cela permet de sécuriser le rôle (non modifiable par l''utilisateur) tout en 
gardant le flow de signup client simple.';

-- Vérification : Lister les triggers sur auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name LIKE '%sync_role%'
ORDER BY trigger_name;

-- Note : Pour les users existants, il faudra exécuter une migration de données
-- séparée si nécessaire. Ce trigger ne s'applique qu'aux nouveaux users.
