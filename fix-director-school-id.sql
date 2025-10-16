-- ============================================
-- DIAGNOSTIC ET CORRECTION : Director sans school_id
-- ============================================
-- Ce script diagnostique et corrige les utilisateurs Director
-- qui n'ont pas de school_id assigné

-- ============================================
-- ÉTAPE 1 : DIAGNOSTIC
-- ============================================

-- Vérifier tous les utilisateurs Director
SELECT 
  id,
  email,
  full_name,
  role,
  school_id,
  CASE 
    WHEN school_id IS NULL THEN '❌ PAS D''ÉCOLE'
    ELSE '✅ A UNE ÉCOLE'
  END as status
FROM public.users
WHERE role = 'DIRECTOR';

-- Vérifier les écoles existantes
SELECT 
  id,
  name,
  created_at
FROM schools
ORDER BY created_at DESC;

-- Vérifier les Directors sans école mais avec une école créée
SELECT 
  u.id as user_id,
  u.email,
  u.full_name,
  u.school_id as current_school_id,
  s.id as school_id,
  s.name as school_name
FROM public.users u
LEFT JOIN schools s ON s.id IN (
  SELECT id FROM schools 
  ORDER BY created_at DESC 
  LIMIT 1
)
WHERE u.role = 'DIRECTOR' 
  AND u.school_id IS NULL;

-- ============================================
-- ÉTAPE 2 : CORRECTION AUTOMATIQUE
-- ============================================
-- Cette requête associe automatiquement chaque Director sans école
-- à l'école la plus récemment créée (si elle existe)

-- OPTION A : Associer à la dernière école créée
-- Décommentez cette requête pour l'exécuter :

/*
UPDATE public.users
SET school_id = (
  SELECT id FROM schools 
  ORDER BY created_at DESC 
  LIMIT 1
)
WHERE role = 'DIRECTOR' 
  AND school_id IS NULL
  AND EXISTS (SELECT 1 FROM schools);
*/

-- ============================================
-- ÉTAPE 3 : CORRECTION MANUELLE
-- ============================================
-- Si vous voulez associer un Director spécifique à une école spécifique :

-- Remplacez les valeurs ci-dessous :
-- - 'director-email@example.com' par l'email du Director
-- - 'school-uuid' par l'UUID de l'école

/*
UPDATE public.users
SET school_id = 'school-uuid'
WHERE email = 'director-email@example.com'
  AND role = 'DIRECTOR';
*/

-- ============================================
-- ÉTAPE 4 : VÉRIFICATION APRÈS CORRECTION
-- ============================================

-- Vérifier que tous les Directors ont maintenant une école
SELECT 
  id,
  email,
  full_name,
  role,
  school_id,
  CASE 
    WHEN school_id IS NULL THEN '❌ TOUJOURS PAS D''ÉCOLE'
    ELSE '✅ ÉCOLE ASSIGNÉE'
  END as status
FROM public.users
WHERE role = 'DIRECTOR';

-- Vérifier le lien entre Directors et écoles
SELECT 
  u.email as director_email,
  u.full_name as director_name,
  s.name as school_name,
  s.id as school_id
FROM public.users u
JOIN schools s ON u.school_id = s.id
WHERE u.role = 'DIRECTOR';
