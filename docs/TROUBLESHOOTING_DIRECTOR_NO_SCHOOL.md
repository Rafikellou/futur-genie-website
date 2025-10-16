# 🔧 Dépannage : Director ne peut pas créer de classes

## 🐛 Symptôme

Quand vous êtes connecté en tant que **Director** et que vous essayez de créer une classe, vous obtenez :

- **Erreur HTTP 403 (Forbidden)**
- **Message :** `"new row violates row-level security policy for table 'classrooms'"`

![Erreur Screenshot](../path/to/screenshot.png)

---

## 🔍 Diagnostic

### Cause Racine

Votre utilisateur Director a **`school_id = NULL`** dans la table `public.users`.

La politique RLS pour créer une classe vérifie que :
1. Vous êtes un **DIRECTOR**
2. Votre **`school_id`** correspond au **`school_id`** de la classe que vous créez

**Si `school_id = NULL`**, la condition échoue et la création est bloquée.

### Pourquoi `school_id` est NULL ?

Deux scénarios possibles :

1. **Onboarding incomplet** : Vous avez créé votre compte mais n'avez pas terminé l'étape de création d'école sur `/onboarding/school`

2. **Problème de synchronisation** : L'école a été créée mais le `school_id` n'a pas été mis à jour dans votre profil utilisateur

---

## ✅ Solutions

### Solution 1 : Page de Diagnostic (RECOMMANDÉ)

1. Allez sur **`http://localhost:3000/debug/user`** (ou votre URL de prod)
2. Vérifiez l'état de votre profil :
   - ✅ **auth.users** : Doit être présent
   - ✅ **public.users** : Doit avoir `role = 'DIRECTOR'`
   - ❌ **school_id** : Si NULL, c'est le problème
   - ❌ **schools** : Si absent, l'école n'existe pas

3. Suivez les instructions affichées sur la page

### Solution 2 : Compléter l'Onboarding

Si vous n'avez pas encore créé votre école :

1. Allez sur **`/onboarding/school`**
2. Entrez le nom de votre école
3. Cliquez sur **"Créer mon école"**
4. Vous serez redirigé vers le dashboard
5. Essayez de créer une classe à nouveau

### Solution 3 : Correction Manuelle via SQL (Avancé)

Si l'école existe déjà mais n'est pas liée à votre compte :

#### Étape 1 : Diagnostic SQL

Exécutez ce script dans l'éditeur SQL de Supabase :

```sql
-- Vérifier votre profil
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
```

#### Étape 2 : Correction Automatique

Si une école existe, associez-la automatiquement à votre compte :

```sql
-- Associer à la dernière école créée
UPDATE public.users
SET school_id = (
  SELECT id FROM schools 
  ORDER BY created_at DESC 
  LIMIT 1
)
WHERE role = 'DIRECTOR' 
  AND school_id IS NULL
  AND EXISTS (SELECT 1 FROM schools);
```

#### Étape 3 : Correction Manuelle Ciblée

Si vous voulez associer une école spécifique :

```sql
-- Remplacez les valeurs :
-- - 'votre-email@example.com' par votre email
-- - 'uuid-de-l-ecole' par l'UUID de l'école

UPDATE public.users
SET school_id = 'uuid-de-l-ecole'
WHERE email = 'votre-email@example.com'
  AND role = 'DIRECTOR';
```

#### Étape 4 : Vérification

```sql
-- Vérifier que le lien est établi
SELECT 
  u.email as director_email,
  u.full_name as director_name,
  s.name as school_name,
  s.id as school_id
FROM public.users u
JOIN schools s ON u.school_id = s.id
WHERE u.role = 'DIRECTOR';
```

---

## 🧪 Test Après Correction

1. **Rechargez la page** du dashboard
2. Allez sur **`/dashboard/classes`**
3. Cliquez sur **"Créer une classe"**
4. Remplissez le formulaire :
   - Nom : "Classe Test"
   - Niveau : "CP"
5. Cliquez sur **"Créer"**
6. ✅ **Succès** : La classe doit être créée sans erreur

---

## 🔐 Comprendre les Politiques RLS

### Politique INSERT sur `classrooms`

```sql
CREATE POLICY "Directors can create classrooms"
ON classrooms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()           -- ✅ Vérifie l'authentification
    AND users.school_id = classrooms.school_id  -- ❌ ÉCHOUE si school_id = NULL
    AND users.role = 'DIRECTOR'           -- ✅ Vérifie le rôle
  )
);
```

**Explication :**
- La politique vérifie que l'utilisateur connecté (`auth.uid()`) existe dans `public.users`
- Elle vérifie que le `school_id` de l'utilisateur **correspond** au `school_id` de la classe
- **Si `users.school_id = NULL`**, alors `NULL = classrooms.school_id` est **FAUX**
- Résultat : **403 Forbidden**

---

## 📊 Flux d'Onboarding Normal

```
┌─────────────────────────────────────────┐
│ 1. SIGNUP (/signup)                     │
├─────────────────────────────────────────┤
│ • Créer auth.users                      │
│ • Créer public.users                    │
│   - role = 'DIRECTOR'                   │
│   - school_id = NULL  ← Pas encore      │
│ • Redirection → /onboarding/school      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 2. ONBOARDING (/onboarding/school)      │
├─────────────────────────────────────────┤
│ • Formulaire : Nom de l'école           │
│ • Créer schools                         │
│ • Update public.users.school_id  ← FIX  │
│ • Redirection → /dashboard              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 3. DASHBOARD (/dashboard)               │
├─────────────────────────────────────────┤
│ • Vérifier school_id                    │
│ • Si NULL → /onboarding/school          │
│ • Sinon → Afficher dashboard            │
│ • ✅ Peut créer des classes             │
└─────────────────────────────────────────┘
```

---

## 🚨 Cas d'Erreur Fréquents

### Erreur 1 : "Cannot read property 'school_id' of null"

**Cause :** L'utilisateur n'existe pas dans `public.users`

**Solution :**
```sql
-- Créer l'entrée manquante
INSERT INTO public.users (id, email, role, school_id, full_name)
VALUES (
  'auth-user-uuid',
  'email@example.com',
  'DIRECTOR',
  NULL,
  'Nom Complet'
);
```

### Erreur 2 : "School not found"

**Cause :** Le `school_id` pointe vers une école qui n'existe pas

**Solution :**
```sql
-- Réinitialiser le school_id
UPDATE public.users
SET school_id = NULL
WHERE id = 'user-uuid';

-- Puis compléter l'onboarding
```

### Erreur 3 : Boucle de redirection entre `/dashboard` et `/onboarding/school`

**Cause :** Le `school_id` est mis à jour mais la session n'est pas rafraîchie

**Solution :**
1. Déconnectez-vous
2. Reconnectez-vous
3. Le hook `useAuth()` rechargera les données

---

## 📞 Support

Si le problème persiste après avoir essayé toutes les solutions :

1. **Vérifiez les logs Supabase** :
   - Allez dans Supabase Dashboard → Logs
   - Filtrez par "Database" et "Errors"
   - Cherchez les erreurs RLS

2. **Vérifiez les politiques RLS** :
   - Allez dans Supabase Dashboard → Authentication → Policies
   - Vérifiez que les politiques sur `classrooms` sont actives

3. **Contactez le support** avec :
   - Votre email d'utilisateur
   - Le screenshot de l'erreur
   - Le résultat de la page `/debug/user`

---

## 📝 Fichiers Utiles

- **Script SQL de diagnostic** : `fix-director-school-id.sql`
- **Page de diagnostic** : `app/debug/user/page.tsx`
- **Documentation du flux** : `DIRECTOR-ONBOARDING-FLOW.md`
- **Politiques RLS** : `supabase-rls-policies.sql`

---

## ✨ Prévention

Pour éviter ce problème à l'avenir :

1. **Toujours compléter l'onboarding** après le signup
2. **Ne pas supprimer manuellement** les écoles sans réinitialiser les `school_id`
3. **Utiliser la page de diagnostic** régulièrement pour vérifier l'état du profil
4. **Tester le flux complet** après chaque modification des politiques RLS
