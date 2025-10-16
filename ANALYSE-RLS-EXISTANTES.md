# 🔍 Analyse des Politiques RLS Existantes

## 📊 État Actuel des Politiques

### **Table `schools`**

| Politique                   | Commande | Condition                                                                    | Statut |
|-----------------------------|----------|------------------------------------------------------------------------------|--------|
| p_schools_insert_on_signup  | INSERT   | `(auth.uid() IS NOT NULL)`                                                   | ❌ PROBLÈME |
| p_schools_director_update   | UPDATE   | `(app.is_role('DIRECTOR') AND (id = app.current_user_school_id()))`         | ⚠️ Dépend de fonctions |
| p_schools_director_delete   | DELETE   | `null`                                                                       | ⚠️ Vérifier USING |
| schools_read_own            | SELECT   | `null`                                                                       | ⚠️ Vérifier USING |

### **Table `users`**

| Politique                      | Commande | Condition                                                      | Statut |
|--------------------------------|----------|----------------------------------------------------------------|--------|
| p_users_insert_self            | INSERT   | `(id = auth.uid())`                                            | ✅ OK |
| p_users_self_select            | SELECT   | `null`                                                         | ⚠️ Vérifier USING |
| p_users_self_update            | UPDATE   | `(id = app.current_user_id())`                                 | ⚠️ Dépend de fonctions |
| p_users_director_select        | SELECT   | `null`                                                         | ⚠️ Vérifier USING |
| p_users_director_update        | UPDATE   | `(app.is_role('DIRECTOR') AND app.same_school(school_id))`     | ⚠️ Dépend de fonctions |
| p_users_director_delete        | DELETE   | `null`                                                         | ⚠️ Vérifier USING |
| p_users_teacher_select_students| SELECT   | `null`                                                         | ⚠️ Vérifier USING |

### **Table `classrooms`**

| Politique                    | Commande | Condition                                                       | Statut |
|------------------------------|----------|-----------------------------------------------------------------|--------|
| classrooms_select_all_roles  | SELECT   | `null`                                                          | ⚠️ Vérifier USING |
| p_classrooms_director_insert | INSERT   | `(app.is_role('DIRECTOR') AND app.same_school(school_id))`      | ⚠️ Dépend de fonctions |
| p_classrooms_director_update | UPDATE   | `(app.is_role('DIRECTOR') AND app.same_school(school_id))`      | ⚠️ Dépend de fonctions |
| p_classrooms_director_delete | DELETE   | `null`                                                          | ⚠️ Vérifier USING |
| p_classrooms_teacher_update  | UPDATE   | `(app.is_role('TEACHER') AND app.same_classroom(id))`           | ⚠️ Dépend de fonctions |

---

## 🚨 Problème Principal : Politique INSERT sur `schools`

### **Politique Actuelle :**
```sql
CREATE POLICY "p_schools_insert_on_signup"
ON schools FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

**Ce que ça fait :**
- ✅ Vérifie que l'utilisateur est connecté
- ❌ Ne vérifie PAS que l'utilisateur est un DIRECTOR
- ❌ **N'importe qui connecté peut créer une école !**

### **Politique Correcte :**
```sql
CREATE POLICY "p_schools_director_insert"
ON schools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'DIRECTOR'
  )
);
```

**Ce que ça fait :**
- ✅ Vérifie que l'utilisateur est connecté
- ✅ Vérifie que l'utilisateur existe dans `public.users`
- ✅ Vérifie que `users.role = 'DIRECTOR'`
- ✅ **Seuls les DIRECTOR peuvent créer une école**

---

## ⚠️ Problème Secondaire : Fonctions Personnalisées

Vos politiques utilisent des fonctions du schéma `app` :
- `app.is_role('DIRECTOR')`
- `app.same_school(school_id)`
- `app.current_user_school_id()`
- `app.current_user_id()`

### **Vérification Nécessaire :**

Ces fonctions existent-elles ? Exécutez dans SQL Editor :

```sql
-- Vérifier si le schéma app existe
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'app';

-- Lister les fonctions du schéma app
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'app'
ORDER BY routine_name;
```

### **Si les fonctions n'existent pas :**

Deux options :

#### **Option A : Remplacer par des conditions directes (RECOMMANDÉ)**
```sql
-- Au lieu de : app.is_role('DIRECTOR')
-- Utiliser :
EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid()
  AND users.role = 'DIRECTOR'
)

-- Au lieu de : app.same_school(school_id)
-- Utiliser :
EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid()
  AND users.school_id = school_id
)
```

#### **Option B : Créer les fonctions manquantes**
```sql
-- Créer le schéma app si nécessaire
CREATE SCHEMA IF NOT EXISTS app;

-- Fonction is_role
CREATE OR REPLACE FUNCTION app.is_role(required_role user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = required_role
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Fonction same_school
CREATE OR REPLACE FUNCTION app.same_school(target_school_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND school_id = target_school_id
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Fonction current_user_school_id
CREATE OR REPLACE FUNCTION app.current_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Fonction current_user_id
CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
```

---

## ✅ Solution Immédiate : Corriger la Politique INSERT

### **Étape 1 : Exécuter le Script de Correction**

Dans **SQL Editor**, exécuter le contenu du fichier `fix-schools-insert-policy.sql` :

```sql
-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "p_schools_insert_on_signup" ON schools;

-- Créer la nouvelle politique
CREATE POLICY "p_schools_director_insert"
ON schools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'DIRECTOR'
  )
);
```

### **Étape 2 : Vérifier**

```sql
SELECT 
  policyname, 
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'schools'
AND cmd = 'INSERT';
```

**Résultat attendu :**
```
policyname: p_schools_director_insert
cmd: INSERT
with_check: EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'DIRECTOR')
```

### **Étape 3 : Tester**

1. Retourner sur l'application
2. Aller sur `/onboarding/school`
3. Remplir le nom de l'école
4. Cliquer "Créer mon école"

**Résultat attendu :** ✅ École créée avec succès !

---

## 📋 Checklist de Vérification

- [ ] Politique `p_schools_insert_on_signup` supprimée
- [ ] Nouvelle politique `p_schools_director_insert` créée
- [ ] Politique vérifie `users.role = 'DIRECTOR'`
- [ ] Test de création d'école réussi
- [ ] Redirection vers `/dashboard` fonctionne
- [ ] Nom de l'école affiché dans le header

---

## 🎯 Résumé

**Problème :** La politique INSERT sur `schools` ne vérifiait pas le rôle DIRECTOR

**Solution :** Remplacer par une politique qui vérifie `users.role = 'DIRECTOR'`

**Fichier à exécuter :** `fix-schools-insert-policy.sql`

**Après correction :** L'application devrait fonctionner correctement ! 🚀
