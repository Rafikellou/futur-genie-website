-- ============================================
-- FIX v2 : Politique INSERT pour la table schools
-- ============================================
-- CORRECTION : Spécifier explicitement public.users

-- 1. Supprimer la politique actuelle
DROP POLICY IF EXISTS "p_schools_director_insert" ON schools;

-- 2. Créer la nouvelle politique avec public.users explicite
CREATE POLICY "p_schools_director_insert"
ON public.schools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE public.users.id = auth.uid()
    AND public.users.role = 'DIRECTOR'::user_role
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
AND cmd = 'INSERT';
