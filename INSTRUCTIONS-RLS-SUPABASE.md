# 🛡️ Instructions : Configuration des Politiques RLS dans Supabase

## 🚨 Problème Actuel

L'erreur `"new row violates row-level security policy for table "schools""` indique que **les politiques RLS n'existent pas ou sont mal configurées** dans Supabase.

**Le code frontend fonctionne correctement** (les logs le prouvent), mais Supabase bloque l'insertion car les politiques de sécurité ne sont pas définies.

---

## ✅ Solution : Créer les Politiques RLS

### **Étape 1 : Accéder à Supabase SQL Editor**

1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet **Futur Génie**
3. Dans le menu de gauche, cliquer sur **SQL Editor**

---

### **Étape 2 : Exécuter le Script SQL**

1. Cliquer sur **New Query**
2. Copier-coller le contenu du fichier `supabase-rls-policies.sql`
3. Cliquer sur **Run** (ou Ctrl+Enter)

**OU** exécuter les commandes une par une ci-dessous :

---

### **Politique CRITIQUE pour la Table `schools`**

```sql
-- Activer RLS sur la table schools
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Politique INSERT: Seuls les DIRECTOR peuvent créer une école
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
```

---

### **Politique pour la Table `public.users`**

```sql
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
```

---

### **Politique pour la Table `classrooms`**

```sql
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
```

---

### **Étape 3 : Vérifier que les Politiques sont Créées**

Exécuter cette requête pour vérifier :

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Résultat attendu :**

| tablename   | policyname                        | cmd    |
|-------------|-----------------------------------|--------|
| classrooms  | Directors can create classrooms   | INSERT |
| classrooms  | School users can view classrooms  | SELECT |
| schools     | Directors can create schools      | INSERT |
| schools     | Users can view their school       | SELECT |
| users       | Users can insert own data         | INSERT |
| users       | Users can view own data           | SELECT |
| users       | Users can update own data         | UPDATE |

---

### **Étape 4 : Tester à Nouveau**

1. **Retourner sur l'application**
2. **Créer un nouveau compte** (ou utiliser un compte existant)
3. **Aller sur la page d'onboarding** `/onboarding/school`
4. **Remplir le nom de l'école**
5. **Cliquer "Créer mon école"**

**Résultat attendu :** ✅ École créée avec succès, redirection vers `/dashboard`

---

## 🔍 Explication : Pourquoi Ça Ne Marchait Pas ?

### **Avant (Sans Politiques RLS) :**

```
Frontend → supabase.from("schools").insert([...])
    ↓
Supabase vérifie les politiques RLS
    ↓
❌ AUCUNE POLITIQUE TROUVÉE
    ↓
Erreur: "new row violates row-level security policy"
```

### **Après (Avec Politiques RLS) :**

```
Frontend → supabase.from("schools").insert([...])
    ↓
Supabase vérifie les politiques RLS
    ↓
Politique "Directors can create schools" :
  - Vérifie que auth.uid() existe dans public.users
  - Vérifie que users.role = 'DIRECTOR'
    ↓
✅ VÉRIFICATIONS PASSÉES
    ↓
École créée avec succès
```

---

## 🎯 Politique RLS Expliquée

### **La Politique Critique :**

```sql
CREATE POLICY "Directors can create schools"
ON schools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()  -- L'utilisateur connecté
    AND users.role = 'DIRECTOR'  -- Doit être DIRECTOR
  )
);
```

**Ce que fait cette politique :**
1. Quand quelqu'un essaie d'insérer dans `schools`
2. Supabase vérifie : "Est-ce que `auth.uid()` (l'utilisateur connecté) existe dans `public.users` avec `role = 'DIRECTOR'` ?"
3. Si OUI → Insertion autorisée ✅
4. Si NON → Erreur RLS ❌

**Pourquoi ça marche maintenant :**
- Le code frontend récupère bien les données de `public.users` (établit le contexte)
- L'utilisateur existe dans `public.users` avec `role = 'DIRECTOR'`
- La politique RLS vérifie et trouve l'utilisateur
- ✅ Insertion autorisée

---

## 📋 Checklist Finale

Après avoir exécuté les scripts SQL :

- [ ] **Politiques créées** : Vérifier avec la requête `SELECT * FROM pg_policies`
- [ ] **RLS activé** : Vérifier que `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` a été exécuté
- [ ] **Tester la création d'école** : Créer un nouveau compte et une école
- [ ] **Vérifier les logs** : Les logs doivent montrer "École créée avec succès"
- [ ] **Dashboard accessible** : Redirection vers `/dashboard` avec le nom de l'école affiché

---

## 🚀 Résumé

**Le problème n'était PAS dans le code frontend**, mais dans **l'absence de politiques RLS dans Supabase**.

**Solution :**
1. Exécuter le script SQL `supabase-rls-policies.sql` dans Supabase SQL Editor
2. Vérifier que les politiques sont créées
3. Tester à nouveau la création d'école

**Après cela, tout devrait fonctionner !** ✅
