-- ============================================
-- POLITIQUES RLS POUR FUTUR GÉNIE
-- ============================================
-- Ce fichier contient toutes les politiques Row Level Security
-- nécessaires pour le bon fonctionnement de l'application

-- ============================================
-- TABLE: public.users
-- ============================================

-- Activer RLS sur la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique SELECT: Un utilisateur peut voir ses propres données
CREATE POLICY "Users can view own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Politique INSERT: Création lors du signup
CREATE POLICY "Users can insert own data"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Politique UPDATE: Mise à jour de ses propres données
CREATE POLICY "Users can update own data"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- TABLE: schools
-- ============================================

-- Activer RLS sur la table schools
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Politique INSERT: Seuls les DIRECTOR peuvent créer une école
-- CRITIQUE: Cette politique vérifie que l'utilisateur existe dans public.users avec role DIRECTOR
CREATE POLICY "Directors can create schools"
ON schools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'DIRECTOR'
  )
);

-- Politique SELECT: Les utilisateurs peuvent voir leur école
CREATE POLICY "Users can view their school"
ON schools FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.school_id = schools.id
  )
);

-- Politique UPDATE: Les directeurs peuvent modifier leur école
CREATE POLICY "Directors can update their school"
ON schools FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.school_id = schools.id
    AND users.role = 'DIRECTOR'
  )
);

-- ============================================
-- TABLE: classrooms
-- ============================================

-- Activer RLS sur la table classrooms
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

-- Politique SELECT: Les utilisateurs de l'école peuvent voir les classes
CREATE POLICY "School users can view classrooms"
ON classrooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.school_id = classrooms.school_id
  )
);

-- Politique INSERT: Les directeurs peuvent créer des classes
CREATE POLICY "Directors can create classrooms"
ON classrooms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.school_id = classrooms.school_id
    AND users.role = 'DIRECTOR'
  )
);

-- Politique UPDATE: Les directeurs peuvent modifier les classes
CREATE POLICY "Directors can update classrooms"
ON classrooms FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.school_id = classrooms.school_id
    AND users.role = 'DIRECTOR'
  )
);

-- Politique DELETE: Les directeurs peuvent supprimer les classes
CREATE POLICY "Directors can delete classrooms"
ON classrooms FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.school_id = classrooms.school_id
    AND users.role = 'DIRECTOR'
  )
);

-- ============================================
-- VÉRIFICATION DES POLITIQUES
-- ============================================

-- Pour vérifier que les politiques sont bien créées, exécutez :
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
