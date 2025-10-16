# 🔍 Checklist de Débogage Complète - Erreur RLS Persistante

## 🚨 Problème

L'erreur `"new row violates row-level security policy for table "schools""` persiste malgré :
- ✅ Politique RLS correcte créée
- ✅ Code frontend qui récupère les données user
- ✅ Logs montrant que le contexte est établi

---

## 📋 Checklist Complète à Vérifier dans Supabase

### **1. Vérifier que l'Utilisateur Existe dans `public.users`**

**Dans SQL Editor :**
```sql
-- Remplacer par l'email du user qui teste
SELECT 
  id, 
  email, 
  role, 
  school_id,
  created_at
FROM public.users
WHERE email = 'kellourafikdirector15@gmail.com';
```

**Résultat attendu :**
- ✅ Une ligne doit exister
- ✅ `role` doit être `'DIRECTOR'`
- ✅ `school_id` doit être `NULL` (avant création d'école)

**Si AUCUNE ligne :** C'est le problème ! L'utilisateur n'existe que dans `auth.users`, pas dans `public.users`.

---

### **2. Vérifier la Politique RLS INSERT sur `schools`**

**Dans SQL Editor :**
```sql
SELECT 
  policyname,
  cmd,
  with_check,
  qual
FROM pg_policies
WHERE tablename = 'schools'
AND cmd = 'INSERT';
```

**Résultat attendu :**
```sql
policyname: p_schools_director_insert
cmd: INSERT
with_check: EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'DIRECTOR')
```

**Vérifier :**
- ✅ La politique vérifie `users.role = 'DIRECTOR'`
- ✅ Utilise `auth.uid()`

---

### **3. Vérifier que RLS est Activé sur `schools`**

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'schools';
```

**Résultat attendu :**
- `rls_enabled` = `true`

---

### **4. Tester la Politique Manuellement**

**Connectez-vous en tant que l'utilisateur problématique et testez :**

```sql
-- 1. Vérifier l'ID de l'utilisateur connecté
SELECT auth.uid();

-- 2. Vérifier si l'utilisateur existe dans public.users
SELECT id, role FROM public.users WHERE id = auth.uid();

-- 3. Tester la condition de la politique
SELECT EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid()
  AND users.role = 'DIRECTOR'
) AS can_create_school;
```

**Résultat attendu :**
- `can_create_school` = `true`

**Si `false` :** La politique échoue, vérifier pourquoi.

---

### **5. Vérifier les Triggers sur la Table `users`**

Il pourrait y avoir un trigger qui empêche l'insertion dans `public.users` :

```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND event_object_schema = 'public';
```

---

### **6. Vérifier les Politiques RLS sur `public.users`**

```sql
SELECT 
  policyname,
  cmd,
  with_check,
  qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;
```

**Vérifier qu'il existe une politique INSERT :**
```sql
policyname: p_users_insert_self
cmd: INSERT
with_check: (id = auth.uid())
```

---

### **7. Vérifier les Logs Supabase**

**Dans Supabase Dashboard :**
1. Menu → **Logs**
2. Sélectionner **Postgres Logs**
3. Chercher les erreurs autour du moment où vous testez

**Chercher :**
- Erreurs RLS
- Erreurs de contraintes
- Erreurs de triggers

---

### **8. Vérifier la Configuration Auth**

**Dans Supabase Dashboard :**
1. Menu → **Authentication** → **Settings**
2. Vérifier :
   - ✅ Email confirmations : Peut être désactivé pour les tests
   - ✅ Auto-confirm users : Activé pour les tests

---

### **9. Test de Création Directe (Bypass RLS)**

**Pour tester si c'est vraiment RLS ou autre chose :**

```sql
-- ATTENTION : Désactiver temporairement RLS pour tester
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;

-- Tester la création d'école via l'app

-- Réactiver RLS immédiatement après
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
```

**Si ça fonctionne sans RLS :** Le problème est bien dans la politique RLS.
**Si ça ne fonctionne pas :** Le problème est ailleurs (contraintes, triggers, etc.).

---

## 🎯 Scénarios Probables

### **Scénario 1 : L'Utilisateur N'existe Pas dans `public.users`**

**Symptômes :**
- Utilisateur existe dans `auth.users`
- Utilisateur N'existe PAS dans `public.users`
- Erreur RLS lors de création d'école

**Cause :**
- L'insertion dans `public.users` a échoué lors du signup
- Problème de politique RLS sur `public.users`
- Trigger qui bloque l'insertion

**Solution :**
```sql
-- Insérer manuellement l'utilisateur dans public.users
INSERT INTO public.users (id, email, role, full_name, school_id)
VALUES (
  'uuid-de-auth-users',  -- Récupérer depuis auth.users
  'email@example.com',
  'DIRECTOR',
  'Nom Complet',
  NULL
);
```

---

### **Scénario 2 : Politique RLS Incorrecte**

**Symptômes :**
- Utilisateur existe dans `public.users` avec `role = 'DIRECTOR'`
- Erreur RLS persiste

**Cause :**
- La politique vérifie autre chose
- Problème de schéma (`users` vs `public.users`)
- Type de données incorrect (`user_role` vs `text`)

**Solution :**
```sql
-- Recréer la politique avec le bon type
DROP POLICY IF EXISTS "p_schools_director_insert" ON schools;

CREATE POLICY "p_schools_director_insert"
ON public.schools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE public.users.id = auth.uid()
    AND public.users.role = 'DIRECTOR'::user_role
  )
);
```

---

### **Scénario 3 : Conflit avec d'Autres Politiques**

**Symptômes :**
- Plusieurs politiques INSERT sur `schools`
- Comportement imprévisible

**Cause :**
- Politiques RLS sont évaluées avec `OR`
- Une politique restrictive peut bloquer

**Solution :**
```sql
-- Lister toutes les politiques INSERT
SELECT policyname FROM pg_policies
WHERE tablename = 'schools' AND cmd = 'INSERT';

-- Supprimer les politiques en trop
DROP POLICY IF EXISTS "autre_politique" ON schools;
```

---

### **Scénario 4 : Problème de Session/Cache**

**Symptômes :**
- Fonctionne pour certains users, pas d'autres
- Logs montrent que tout est OK

**Cause :**
- Session expirée
- Cache du navigateur
- Token JWT invalide

**Solution :**
1. Se déconnecter complètement
2. Vider le cache du navigateur
3. Se reconnecter
4. Retester

---

## 🔧 Actions Immédiates à Faire

### **Action 1 : Vérifier l'Utilisateur dans `public.users`**

```sql
SELECT * FROM public.users 
WHERE email = 'kellourafikdirector15@gmail.com';
```

**Si AUCUN résultat :** Créer l'utilisateur manuellement :

```sql
-- 1. Récupérer l'ID depuis auth.users
SELECT id, email FROM auth.users 
WHERE email = 'kellourafikdirector15@gmail.com';

-- 2. Insérer dans public.users (remplacer l'UUID)
INSERT INTO public.users (id, email, role, full_name, school_id)
VALUES (
  'uuid-récupéré-ci-dessus',
  'kellourafikdirector15@gmail.com',
  'DIRECTOR',
  'Kellou Mohamed Rafik',
  NULL
);
```

### **Action 2 : Vérifier les Logs en Temps Réel**

1. Ouvrir **Supabase Dashboard** → **Logs** → **Postgres Logs**
2. Tester la création d'école
3. Observer les erreurs en temps réel

### **Action 3 : Test avec RLS Désactivé (Temporaire)**

```sql
-- Désactiver RLS temporairement
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;

-- Tester via l'app

-- Réactiver immédiatement
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
```

---

## 📊 Rapport à Fournir

Après avoir exécuté les vérifications, notez :

1. **L'utilisateur existe dans `public.users` ?** OUI / NON
2. **Si OUI, quel est son `role` ?** _____
3. **Résultat de la requête `can_create_school` ?** true / false
4. **Nombre de politiques INSERT sur `schools` ?** _____
5. **RLS activé sur `schools` ?** OUI / NON
6. **Erreurs dans les logs Postgres ?** _____

---

**Exécutez ces vérifications et partagez les résultats !** 🔍
