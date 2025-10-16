# 🎯 Flux d'Onboarding pour les Directeurs (VERSION FINALE)

## 📋 Problèmes Identifiés

### **Problème 1 : Erreur RLS lors de la création d'école**
**Erreur :** `new row violates row-level security policy for table "schools"`

**Causes :**
1. La table `schools` a une politique RLS qui vérifie que l'utilisateur existe dans `public.users` avec le rôle `DIRECTOR`
2. L'ancien flux tentait de créer l'école **avant** que l'utilisateur ne soit créé dans `public.users`
3. Résultat : violation RLS car l'utilisateur n'existait que dans `auth.users`

### **Problème 2 : Erreur RLS sur la page d'onboarding**
**Erreur :** Même erreur RLS lors de la création d'école sur `/onboarding/school`

**Causes :**
1. La page d'onboarding utilisait `supabase.auth.getUser()` qui récupère uniquement les données de `auth.users`
2. Les politiques RLS de Supabase vérifient le contexte de `public.users`, pas `auth.users`
3. Sans récupérer les données de `public.users`, le contexte RLS n'était pas correctement établi

### **Problème 3 : UX confuse**
- Demander le nom de l'école dans le formulaire de signup, puis le redemander sur la page d'onboarding
- Pas de séparation claire entre création du compte et configuration de l'école

## ✅ Solution Implémentée : Flux Séquentiel Multi-Étapes

### **Étape 1 : Signup (Page `/signup`)**

**Fichier :** `components/auth/SignupForm.tsx`

**Actions :**
1. ✅ Créer l'utilisateur dans `auth.users` avec :
   - `email`, `password`
   - `user_metadata.full_name`
   - `user_metadata.role = "DIRECTOR"`

2. ✅ Créer l'entrée dans `public.users` avec :
   - `id` (même que auth.users)
   - `role = "DIRECTOR"`
   - `school_id = NULL` ⚠️ **Important : pas encore d'école**
   - `email`, `full_name`

3. ✅ Connexion automatique avec `signInWithPassword`

4. ✅ Redirection vers `/onboarding/school`

**Changements par rapport à l'ancienne version :**
- ❌ Supprimé : Champ "Nom de l'école" dans le formulaire de signup
- ❌ Supprimé : `user_metadata.school_name` (plus nécessaire)
- ✅ Formulaire simplifié : Nom, Email, Mot de passe uniquement

**Résultat :** L'utilisateur est créé et authentifié, mais sans école.

---

### **Étape 2 : Onboarding École (Page `/onboarding/school`)**

**Fichier :** `app/onboarding/school/page.tsx`

**Vérifications initiales (useEffect) :**
1. ✅ Vérifier l'authentification via `supabase.auth.getUser()`
2. ✅ **CRUCIAL : Récupérer les données complètes depuis `public.users`** (pas juste `auth.users`)
   - Cela établit le contexte RLS correct pour Supabase
   - Sans cela, les politiques RLS échouent
3. ✅ Vérifier le rôle : `userData.role === "DIRECTOR"` ?
4. ✅ Si `userData.school_id` existe → Redirection `/dashboard`
5. ✅ Stocker `userData` dans l'état local `currentUser`

**Actions au submit :**
1. ✅ Créer l'école dans `schools` 
   - **RLS OK** car `currentUser` existe dans `public.users` avec `role = "DIRECTOR"`
   - Le contexte RLS est correctement établi
2. ✅ Mettre à jour `public.users.school_id` avec l'ID de l'école créée
3. ✅ Attendre 500ms pour la synchronisation de la base de données
4. ✅ Redirection vers `/dashboard`

**Changements par rapport à l'ancienne version :**
- ✅ **FIX CRITIQUE** : Récupération complète depuis `public.users` au lieu de `auth.users`
- ✅ Stockage de `currentUser` dans l'état pour utilisation lors de la création d'école
- ✅ Meilleure gestion des erreurs avec messages explicites
- ✅ Délai de synchronisation avant redirection

**Résultat :** L'école est créée et liée au directeur.

---

### **Étape 3 : Dashboard (Page `/dashboard`)**

**Fichier :** `app/dashboard/page.tsx`

**Vérifications :**
- ✅ Hook `useAuth()` récupère les données complètes depuis `public.users`
- ✅ Si `user.school_id === null` → Redirection automatique vers `/onboarding/school`
- ✅ Sinon → Affichage du dashboard complet

**Affichage des données :**
- ✅ `DashboardLayout` récupère et affiche le nom de l'école depuis `schools` table
- ✅ `DashboardStats` charge les statistiques liées à `school_id`
- ✅ Toutes les données sont correctement synchronisées

**Fichiers impliqués :**
- `app/dashboard/page.tsx` : Vérification et redirection
- `components/dashboard/DashboardLayout.tsx` : Affichage nom d'école dans le header
- `components/dashboard/DashboardStats.tsx` : Statistiques de l'école

**Résultat :** Le directeur accède à son environnement avec toutes les données de son école.

---

## 🔄 Flux Complet Visualisé

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SIGNUP (/signup)                                         │
├─────────────────────────────────────────────────────────────┤
│ • Formulaire : Nom, Email, Mot de passe                     │
│ • Créer auth.users (email, password, metadata)              │
│ • Créer public.users (role=DIRECTOR, school_id=NULL)        │
│ • Connexion automatique                                     │
│ • Redirection → /onboarding/school                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ONBOARDING (/onboarding/school)                          │
├─────────────────────────────────────────────────────────────┤
│ • Vérifier auth.users (sinon → /login)                      │
│ • 🔑 RÉCUPÉRER public.users (établir contexte RLS)          │
│ • Vérifier role === DIRECTOR                                │
│ • Vérifier si école existe (oui → /dashboard)               │
│ • Formulaire création école (nom uniquement)                │
│ • Créer schools (RLS OK car contexte établi)                │
│ • Update public.users.school_id                             │
│ • Attendre 500ms (sync DB)                                  │
│ • Redirection → /dashboard                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. DASHBOARD (/dashboard)                                   │
├─────────────────────────────────────────────────────────────┤
│ • Hook useAuth() récupère public.users                      │
│ • Vérifier school_id (null → /onboarding/school)            │
│ • DashboardLayout récupère schools.name                     │
│ • DashboardStats charge les statistiques                    │
│ • Afficher dashboard complet avec données école             │
│ • Créer classes, inviter enseignants, etc.                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Sécurité RLS

### **Comprendre le Contexte RLS de Supabase**

**Point clé :** Les politiques RLS de Supabase vérifient le contexte de l'utilisateur connecté en regardant `public.users`, **PAS** `auth.users`.

**Problème initial (❌ Échec) :**
```
1. Créer auth.users ✅
2. Créer schools ❌ 
   → RLS vérifie : "Est-ce que l'utilisateur connecté existe dans public.users avec role=DIRECTOR ?"
   → Réponse : NON (pas encore créé)
   → ÉCHEC : "new row violates row-level security policy"
3. Créer public.users ⏹️ (jamais atteint)
```

**Problème sur la page d'onboarding (❌ Échec) :**
```
1. Page charge, utilise supabase.auth.getUser() ✅
2. Tentative de créer schools ❌
   → RLS vérifie : "Est-ce que l'utilisateur connecté existe dans public.users avec role=DIRECTOR ?"
   → Réponse : OUI, mais le CONTEXTE RLS n'est pas établi car on n'a jamais récupéré les données de public.users
   → ÉCHEC : "new row violates row-level security policy"
```

**Solution finale (✅ Succès) :**
```
1. [SIGNUP] Créer auth.users ✅
2. [SIGNUP] Créer public.users ✅
3. [SIGNUP] Connexion ✅
4. [ONBOARDING] Récupérer public.users (établit le contexte RLS) ✅
5. [ONBOARDING] Créer schools ✅
   → RLS vérifie : "Est-ce que l'utilisateur connecté existe dans public.users avec role=DIRECTOR ?"
   → Réponse : OUI (contexte établi à l'étape 4)
   → SUCCÈS
6. [ONBOARDING] Update public.users.school_id ✅
7. [DASHBOARD] Afficher les données ✅
```

### **La Clé du Succès : Récupérer `public.users` Avant Toute Opération RLS**

```typescript
// ❌ MAUVAIS : Utiliser uniquement auth.users
const { data: { user } } = await supabase.auth.getUser();
// Le contexte RLS n'est PAS établi

// ✅ BON : Récupérer public.users pour établir le contexte
const { data: { user: authUser } } = await supabase.auth.getUser();
const { data: userData } = await supabase
  .from("users")
  .select("*")
  .eq("id", authUser.id)
  .single();
// Le contexte RLS est maintenant établi ✅
```

---

## 📝 Fichiers Modifiés/Créés

### **Modifiés :**

1. **`lib/types/database.ts`**
   - ❌ Supprimé : `schoolName` de `SignupFormData`
   - Interface simplifiée pour le formulaire de signup

2. **`components/auth/SignupForm.tsx`**
   - ❌ Supprimé : Champ "Nom de l'école" du formulaire
   - ❌ Supprimé : `user_metadata.school_name`
   - ❌ Supprimé : Création de l'école pendant le signup
   - ✅ Formulaire simplifié : Nom, Email, Mot de passe uniquement
   - ✅ Connexion automatique après signup
   - ✅ Redirection vers `/onboarding/school`

3. **`app/onboarding/school/page.tsx`** *(créé)*
   - ✅ Récupération complète de `public.users` (établit contexte RLS)
   - ✅ Vérifications de sécurité (auth, role, school_id existant)
   - ✅ Stockage de `currentUser` dans l'état
   - ✅ Création école avec contexte RLS correct
   - ✅ Mise à jour `public.users.school_id`
   - ✅ Délai de synchronisation avant redirection
   - ✅ Gestion d'erreurs améliorée

4. **`app/dashboard/page.tsx`**
   - ✅ Vérification `school_id`
   - ✅ Redirection automatique vers onboarding si nécessaire
   - ✅ Import de `useEffect` et `useRouter`

5. **`components/dashboard/DashboardLayout.tsx`**
   - ✅ Récupération des données de l'école depuis `schools` table
   - ✅ Affichage du nom de l'école dans le header
   - ✅ Import de `useState`, `useEffect`, `supabase`
   - ✅ Utilisation du prop `user` pour accéder à `school_id`

---

## 🧪 Test du Flux

### **Scénario de test complet :**

#### **Étape 1 : Signup**
1. Aller sur `/signup`
2. Remplir le formulaire :
   - Nom complet : "Jean Dupont"
   - Email : "jean.dupont@ecole.fr"
   - Mot de passe : "Test1234!"
3. Cliquer "Créer mon compte école"
4. ✅ **Vérifier :** Redirection automatique vers `/onboarding/school`

#### **Étape 2 : Onboarding École**
1. Sur `/onboarding/school`
2. ✅ **Vérifier :** Page affiche "Bienvenue !" avec emoji 🏫
3. Remplir le nom de l'école : "École Primaire Victor Hugo"
4. Cliquer "Créer mon école"
5. ✅ **Vérifier :** Pas d'erreur RLS
6. ✅ **Vérifier :** Redirection vers `/dashboard`

#### **Étape 3 : Dashboard**
1. Sur `/dashboard`
2. ✅ **Vérifier :** Header affiche "École : École Primaire Victor Hugo"
3. ✅ **Vérifier :** Statistiques affichent 0 classes, 0 enseignants, etc.
4. ✅ **Vérifier :** Possibilité de naviguer vers "Classes"
5. ✅ **Vérifier :** Bouton "Déconnexion" fonctionne

### **Vérification base de données :**

```sql
-- Vérifier l'utilisateur
SELECT id, email, role, school_id FROM public.users WHERE email = 'test@example.com';

-- Vérifier l'école
SELECT id, name FROM public.schools WHERE name = 'Mon École Test';

-- Vérifier le lien
SELECT u.email, s.name 
FROM public.users u 
JOIN public.schools s ON u.school_id = s.id 
WHERE u.email = 'test@example.com';
```

---

## 🚀 Prochaines Étapes

Après l'onboarding, le directeur peut :

1. ✅ **Créer des classes** (`/dashboard/classes`)
2. ✅ **Générer des jetons d'invitation** pour enseignants
3. ✅ **Gérer son école** (paramètres, statistiques, etc.)

---

## 🔧 Maintenance

### **Si un utilisateur est bloqué en onboarding :**

```sql
-- Vérifier l'état
SELECT id, email, role, school_id FROM public.users WHERE email = 'user@example.com';

-- Si school_id est NULL mais école existe
UPDATE public.users 
SET school_id = (SELECT id FROM schools WHERE name = 'Nom École')
WHERE email = 'user@example.com';
```

### **Si besoin de réinitialiser un directeur :**

```sql
-- Supprimer l'école (cascade supprimera les classes, etc.)
DELETE FROM schools WHERE id = 'school-uuid';

-- Réinitialiser le user
UPDATE public.users SET school_id = NULL WHERE id = 'user-uuid';

-- L'utilisateur sera redirigé vers /onboarding/school à la prochaine connexion
```

---

## ✨ Avantages de cette Approche

1. **✅ Respect des politiques RLS** : Création séquentielle garantit que les vérifications passent
2. **✅ UX fluide** : Pas de rechargement, redirections automatiques
3. **✅ Sécurité** : Vérifications à chaque étape
4. **✅ Flexibilité** : Facile d'ajouter des étapes d'onboarding supplémentaires
5. **✅ Récupération** : Si interruption, l'utilisateur reprend où il s'est arrêté
6. **✅ Données temporaires** : `user_metadata` stocke le nom d'école pour pré-remplissage

---

## 📞 Support

En cas de problème, vérifier :
- ✅ Les politiques RLS sur `schools` et `users`
- ✅ Les logs Supabase (erreurs d'insertion)
- ✅ L'état de `auth.users` vs `public.users`
- ✅ Les redirections (boucles infinies ?)
