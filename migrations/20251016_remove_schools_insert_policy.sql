-- ============================================
-- Migration : Suppression de la RLS policy inutile sur schools
-- Date : 16 octobre 2025
-- ============================================
-- 
-- CONTEXTE :
-- La policy p_schools_director_insert est inutile car :
-- 1. L'Edge Function director_onboarding_complete utilise le service role key (bypass RLS)
-- 2. Aucune insertion directe depuis le client
-- 3. La complexité de la policy ne résout aucun problème réel
--
-- HISTORIQUE :
-- - La policy avait été complexifiée pour gérer un problème CORS/OPTIONS
-- - Le vrai problème était dans l'Edge Function (déjà résolu)
-- - La policy n'a jamais été utilisée en pratique
--
-- IMPACT :
-- - Aucun impact fonctionnel (la policy n'était jamais utilisée)
-- - Simplifie le code et réduit la confusion
-- - Si besoin futur d'insertion directe, il faudra recréer une policy simple
--
-- ============================================

-- Supprimer la policy inutile
DROP POLICY IF EXISTS p_schools_director_insert ON schools;

-- Vérification : Lister les policies restantes sur schools
SELECT 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'schools'
ORDER BY cmd, policyname;

-- Note : Les policies SELECT, UPDATE, DELETE restent inchangées
-- car elles sont utilisées pour contrôler l'accès aux écoles existantes
