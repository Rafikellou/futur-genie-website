# 🔍 Guide : Vérifier les Politiques RLS Existantes

## 📋 Méthode 1 : Via Supabase Dashboard (Interface Graphique)

### **Étape 1 : Accéder aux Tables**
1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet **Futur Génie**
3. Menu de gauche → **Database** → **Tables**

### **Étape 2 : Vérifier RLS pour chaque table**

#### **Table `schools` :**
1. Cliquer sur la table **`schools`**
2. Cliquer sur l'onglet **`RLS`** (Row Level Security)
3. **Vérifier :**
   - ✅ RLS est-il activé ? (Toggle "Enable RLS" doit être ON)
   - ✅ Politiques existantes ?

**Politiques attendues pour `schools` :**
- `Directors can create schools` (INSERT)
- `Users can view their school` (SELECT)

#### **Table `public.users` :**
1. Cliquer sur la table **`users`**
2. Cliquer sur l'onglet **`RLS`**
3. **Vérifier :**
   - ✅ RLS est-il activé ?
   - ✅ Politiques existantes ?

**Politiques attendues pour `users` :**
- `Users can view own data` (SELECT)
- `Users can insert own data` (INSERT)
- `Users can update own data` (UPDATE)

#### **Table `classrooms` :**
1. Cliquer sur la table **`classrooms`**
2. Cliquer sur l'onglet **`RLS`**
3. **Vérifier :**
   - ✅ RLS est-il activé ?
   - ✅ Politiques existantes ?

**Politiques attendues pour `classrooms` :**
- `School users can view classrooms` (SELECT)
- `Directors can create classrooms` (INSERT)
- `Directors can update classrooms` (UPDATE)
- `Directors can delete classrooms` (DELETE)

---

## 📋 Méthode 2 : Via SQL Editor

### **Requête pour Lister Toutes les Politiques RLS**

1. Menu de gauche → **SQL Editor**
2. Cliquer sur **New Query**
3. Copier-coller cette requête :

```sql
-- Lister toutes les politiques RLS
SELECT 
  schemaname AS schema, 
  tablename AS table, 
  policyname AS policy_name, 
  permissive,
  roles,
  cmd AS command,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

4. Cliquer sur **Run**

### **Vérifier si RLS est Activé sur les Tables**

```sql
-- Vérifier si RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'schools', 'classrooms')
ORDER BY tablename;
```

**Résultat attendu :**
| tablename   | rls_enabled |
|-------------|-------------|
| classrooms  | true        |
| schools     | true        |
| users       | true        |

---

## 🔍 Analyse des Politiques Existantes

### **Scénarios Possibles :**

#### **Scénario 1 : Aucune Politique RLS**
**Symptômes :**
- Aucune politique listée pour `schools`
- Erreur : "new row violates row-level security policy"

**Solution :**
- Exécuter le script `supabase-rls-policies.sql`

---

#### **Scénario 2 : RLS Activé mais Politiques Incorrectes**
**Symptômes :**
- Des politiques existent mais avec des conditions différentes
- Erreur RLS persiste

**Vérifications :**
1. **Politique INSERT sur `schools`** doit vérifier :
   ```sql
   EXISTS (
     SELECT 1 FROM public.users
     WHERE users.id = auth.uid()
     AND users.role = 'DIRECTOR'
   )
   ```

2. **Si la politique vérifie autre chose**, elle doit être modifiée

**Solution :**
- Supprimer les politiques incorrectes
- Recréer avec le bon script

---

#### **Scénario 3 : RLS Non Activé**
**Symptômes :**
- `rls_enabled = false` pour la table `schools`
- Erreur RLS

**Solution :**
```sql
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
```

---

## 🛠️ Commandes Utiles

### **Supprimer une Politique RLS**
```sql
DROP POLICY IF EXISTS "nom_de_la_politique" ON nom_table;
```

### **Désactiver RLS (DÉCONSEILLÉ en production)**
```sql
ALTER TABLE nom_table DISABLE ROW LEVEL SECURITY;
```

### **Activer RLS**
```sql
ALTER TABLE nom_table ENABLE ROW LEVEL SECURITY;
```

### **Voir le Détail d'une Politique**
```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'schools'
AND policyname = 'Directors can create schools';
```

---

## 📊 Checklist de Vérification

Après avoir vérifié les politiques RLS :

- [ ] **Table `schools`** : RLS activé ?
- [ ] **Table `schools`** : Politique INSERT existe ?
- [ ] **Table `schools`** : Politique INSERT vérifie `role = 'DIRECTOR'` ?
- [ ] **Table `users`** : RLS activé ?
- [ ] **Table `users`** : Politiques SELECT, INSERT, UPDATE existent ?
- [ ] **Table `classrooms`** : RLS activé ?
- [ ] **Table `classrooms`** : Politiques SELECT, INSERT existent ?

---

## 🎯 Politique Critique à Vérifier

**La politique la plus importante pour résoudre votre problème :**

```sql
-- Cette politique DOIT exister sur la table schools
CREATE POLICY "Directors can create schools"
ON schools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'DIRECTOR'
  )
);
```

**Points clés :**
1. ✅ Utilise `auth.uid()` (l'utilisateur connecté)
2. ✅ Vérifie dans `public.users` (pas `auth.users`)
3. ✅ Vérifie `users.role = 'DIRECTOR'`

---

## 📝 Rapport à Fournir

Après avoir vérifié, notez :

1. **RLS activé sur `schools` ?** OUI / NON
2. **Nombre de politiques sur `schools` ?** _____
3. **Noms des politiques existantes :**
   - _____________________
   - _____________________
4. **Politique "Directors can create schools" existe ?** OUI / NON
5. **Si OUI, quelle est la condition `with_check` ?**
   ```
   _____________________
   ```

---

## 🚀 Prochaines Étapes

1. **Vérifier les politiques** via Dashboard ou SQL Editor
2. **Comparer avec les politiques attendues** dans `supabase-rls-policies.sql`
3. **Si différences** :
   - Supprimer les politiques incorrectes
   - Exécuter le script `supabase-rls-policies.sql`
4. **Tester à nouveau** la création d'école

---

**Une fois que vous aurez vérifié les politiques existantes, partagez les résultats et je pourrai vous dire exactement quoi modifier !** 🔍
