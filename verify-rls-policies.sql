-- ============================================
-- VÉRIFICATION DES POLITIQUES RLS EXISTANTES
-- ============================================
-- Ce script vérifie les politiques RLS actuellement actives dans Supabase

-- ============================================
-- 1. VÉRIFIER SI RLS EST ACTIVÉ
-- ============================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'schools', 'classrooms')
ORDER BY tablename;

-- ============================================
-- 2. LISTER TOUTES LES POLITIQUES RLS
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'schools', 'classrooms')
ORDER BY tablename, policyname;

-- ============================================
-- 3. DÉTAILS DES POLITIQUES SUR CLASSROOMS
-- ============================================

SELECT 
  policyname as "Nom de la Politique",
  cmd as "Commande",
  CASE 
    WHEN qual IS NOT NULL THEN 'OUI (USING)'
    ELSE 'NON'
  END as "A USING",
  CASE 
    WHEN with_check IS NOT NULL THEN 'OUI (WITH CHECK)'
    ELSE 'NON'
  END as "A WITH CHECK"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'classrooms'
ORDER BY policyname;

-- ============================================
-- 4. VÉRIFIER LES FONCTIONS HELPER (si utilisées)
-- ============================================

-- Vérifier si le schéma 'app' existe
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'app';

-- Vérifier les fonctions dans le schéma 'app'
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'app'
ORDER BY routine_name;

-- ============================================
-- 5. TESTER LA POLITIQUE INSERT SUR CLASSROOMS
-- ============================================

-- Cette requête simule ce que fait la politique RLS
-- Remplacez 'director26@gmaiml.com' par l'email du Director

SELECT 
  u.id as user_id,
  u.email,
  u.role,
  u.school_id as user_school_id,
  s.id as school_id,
  s.name as school_name,
  CASE 
    WHEN u.school_id IS NULL THEN '❌ school_id est NULL'
    WHEN u.school_id = s.id THEN '✅ school_id correspond'
    ELSE '⚠️ school_id ne correspond pas'
  END as status,
  CASE 
    WHEN u.role = 'DIRECTOR' AND u.school_id = s.id THEN '✅ PEUT CRÉER DES CLASSES'
    WHEN u.role = 'DIRECTOR' AND u.school_id IS NULL THEN '❌ BLOQUÉ : school_id NULL'
    WHEN u.role = 'DIRECTOR' AND u.school_id != s.id THEN '❌ BLOQUÉ : school_id différent'
    WHEN u.role != 'DIRECTOR' THEN '❌ BLOQUÉ : pas DIRECTOR'
    ELSE '❌ BLOQUÉ : raison inconnue'
  END as rls_check
FROM public.users u
LEFT JOIN schools s ON u.school_id = s.id
WHERE u.email = 'director26@gmaiml.com';

-- ============================================
-- 6. VÉRIFIER LES DONNÉES DU DIRECTOR
-- ============================================

-- Données complètes du Director
SELECT 
  id,
  email,
  full_name,
  role,
  school_id,
  classroom_id,
  created_at
FROM public.users
WHERE email = 'director26@gmaiml.com';

-- École associée
SELECT 
  s.id,
  s.name,
  s.created_at,
  u.email as director_email
FROM schools s
LEFT JOIN public.users u ON u.school_id = s.id
WHERE u.email = 'director26@gmaiml.com';

-- ============================================
-- 7. TESTER L'INSERTION (SIMULATION)
-- ============================================

-- Cette requête teste si l'insertion passerait la politique RLS
-- ATTENTION : Cette requête ne fait PAS d'insertion réelle, elle simule juste la vérification

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.users
      WHERE users.email = 'director26@gmaiml.com'
      AND users.school_id = (SELECT school_id FROM public.users WHERE email = 'director26@gmaiml.com')
      AND users.role = 'DIRECTOR'
    ) THEN '✅ LA POLITIQUE RLS DEVRAIT PASSER'
    ELSE '❌ LA POLITIQUE RLS VA BLOQUER'
  END as rls_simulation;

-- ============================================
-- 8. VÉRIFIER LE CONTEXTE AUTH
-- ============================================

-- Vérifier l'utilisateur actuellement connecté (si exécuté depuis Supabase Dashboard)
SELECT 
  auth.uid() as current_auth_uid,
  auth.jwt() as current_jwt;

-- Vérifier si l'utilisateur existe dans public.users
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid()
    ) THEN '✅ Utilisateur existe dans public.users'
    ELSE '❌ Utilisateur n''existe PAS dans public.users'
  END as user_exists;
