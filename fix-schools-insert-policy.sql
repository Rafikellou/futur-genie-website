-- ============================================
-- FIX : Politique INSERT pour la table schools
-- ============================================
-- Cette politique doit vérifier que l'utilisateur est un DIRECTOR

-- 1. Supprimer l'ancienne politique trop permissive
DROP POLICY IF EXISTS "p_schools_insert_on_signup" ON schools;

-- 2. Créer la nouvelle politique qui vérifie le rôle DIRECTOR
CREATE POLICY "p_schools_director_insert"
ON schools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'DIRECTOR'
  )
);

-- ============================================
-- VÉRIFICATION : Lister les politiques sur schools
-- ============================================
SELECT 
  policyname, 
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'schools'
ORDER BY cmd, policyname;
