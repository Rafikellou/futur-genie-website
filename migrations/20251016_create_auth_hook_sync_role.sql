-- ============================================
-- Migration : Auth Hook pour synchroniser role vers app_metadata
-- Date : 16 octobre 2025
-- ============================================
-- 
-- CONTEXTE :
-- On ne peut pas créer de trigger directement sur auth.users (permissions).
-- La solution recommandée par Supabase est d'utiliser une Auth Hook.
--
-- SOLUTION :
-- Créer une fonction Postgres dans le schéma public qui sera appelée
-- par Supabase Auth Hook "Custom Access Token" pour ajouter le rôle
-- dans les claims du JWT.
--
-- CONFIGURATION REQUISE :
-- Après cette migration, il faut activer le hook dans le Dashboard :
-- Authentication > Hooks (Beta) > Custom Access Token > Sélectionner la fonction
--
-- ============================================

-- Créer la fonction hook pour ajouter le rôle dans le JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Récupérer les claims actuels
  claims := event->'claims';
  
  -- Récupérer le rôle depuis user_metadata
  user_role := event->'user_metadata'->>'role';
  
  -- Si un rôle est défini, l'ajouter aux claims
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    
    -- Log pour debug
    RAISE LOG 'Custom access token hook: Added user_role % to claims for user %', 
      user_role, event->'user_id';
  END IF;
  
  -- Retourner l'event modifié
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Ajouter un commentaire explicatif
COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS 
'Auth Hook pour ajouter le rôle utilisateur dans les claims du JWT.
Le rôle est lu depuis user_metadata.role et ajouté dans claims.user_role.
Cette fonction doit être configurée dans Authentication > Hooks (Beta) > Custom Access Token.';

-- Créer une policy RLS pour permettre à supabase_auth_admin d'appeler cette fonction
-- (Supabase Auth a besoin de pouvoir exécuter cette fonction)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated, anon, public;

-- Vérification : Lister la fonction créée
SELECT 
  routine_name,
  routine_type,
  data_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'custom_access_token_hook';

-- ============================================
-- INSTRUCTIONS POST-MIGRATION :
-- ============================================
-- 
-- 1. Aller dans le Dashboard Supabase
-- 2. Authentication > Hooks (Beta)
-- 3. Sélectionner "Custom Access Token"
-- 4. Choisir la fonction "public.custom_access_token_hook"
-- 5. Activer le hook
-- 
-- Après activation, tous les nouveaux JWT contiendront le rôle
-- dans claims.user_role (accessible via app.jwt_claim('user_role'))
-- 
-- ============================================
