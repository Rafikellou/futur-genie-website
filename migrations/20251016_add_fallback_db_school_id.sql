-- ============================================
-- Migration : Ajouter fallback DB à app.current_user_school_id()
-- Date : 16 octobre 2025
-- ============================================
-- 
-- CONTEXTE :
-- La fonction actuelle retourne NULL si school_id n'est pas dans le JWT,
-- même si users.school_id existe dans la DB.
--
-- PROBLÈME :
-- Après la création d'école, il peut y avoir un délai de propagation du JWT.
-- Cela peut causer des erreurs 403 sur les RLS policies qui utilisent cette fonction.
--
-- SOLUTION :
-- Ajouter un fallback vers la DB si le JWT ne contient pas school_id.
-- Cohérent avec app.current_user_role() qui a déjà un fallback DB.
--
-- IMPACT :
-- - Élimine les race conditions JWT
-- - Garantit que les RLS policies fonctionnent même si le JWT n'est pas à jour
-- - Améliore la robustesse globale du système
--
-- ============================================

-- Remplacer la fonction existante
CREATE OR REPLACE FUNCTION app.current_user_school_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  sid uuid;
BEGIN
  -- 1) Essayer de récupérer depuis le JWT (app_metadata.school_id)
  sid := app.jwt_claim('school_id')::uuid;
  
  -- 2) Si NULL, fallback vers la base de données
  IF sid IS NULL THEN
    SELECT u.school_id INTO sid
    FROM public.users u
    WHERE u.id = app.current_user_id();
  END IF;
  
  RETURN sid;
END;
$$;

-- Ajouter un commentaire explicatif
COMMENT ON FUNCTION app.current_user_school_id() IS 
'Retourne le school_id de l''utilisateur courant. 
Cherche d''abord dans le JWT (app_metadata.school_id), 
puis fallback vers la table users si non trouvé.
Cela garantit la cohérence même si le JWT n''est pas à jour.';

-- Vérification : Tester la fonction
DO $$
DECLARE
  test_result uuid;
BEGIN
  -- La fonction devrait retourner NULL si aucun utilisateur n'est connecté
  -- (dans le contexte d'une migration, auth.uid() retourne NULL)
  test_result := app.current_user_school_id();
  
  IF test_result IS NULL THEN
    RAISE NOTICE '✅ Fonction créée avec succès. Test OK (NULL attendu en migration).';
  ELSE
    RAISE NOTICE '⚠️ Fonction créée. Résultat inattendu : %', test_result;
  END IF;
END;
$$;

-- Lister les fonctions app.* pour vérification
SELECT 
  routine_name,
  routine_type,
  data_type,
  pg_get_functiondef(p.oid) as definition_preview
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_schema = 'app'
  AND routine_name LIKE 'current_user%'
ORDER BY routine_name;
