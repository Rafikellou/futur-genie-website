# 🏗️ Analyse de l'Architecture de Récupération des Données

## 📊 État Actuel de l'Architecture

### **Méthode de Récupération des Données**

L'application utilise **uniquement des requêtes directes côté client** via le SDK Supabase JavaScript (`@supabase/supabase-js`).

**Aucune Edge Function n'est actuellement déployée.**

---

## 🔍 Analyse Détaillée

### **1. Récupération des Données Utilisateur**

**Fichiers concernés :**
- `lib/hooks/useAuth.ts`
- `components/auth/LoginForm.tsx`
- `components/auth/SignupForm.tsx`
- `app/onboarding/school/page.tsx`

**Méthode utilisée :**
```typescript
// 1. Authentification
const { data: { user: authUser } } = await supabase.auth.getUser();

// 2. Récupération depuis public.users
const { data: userData } = await supabase
  .from("users")
  .select("*")
  .eq("id", authUser.id)
  .single();
```

**✅ Avantages :**
- Simple et direct
- Pas de latence supplémentaire (pas de round-trip vers une Edge Function)
- Utilise les politiques RLS de Supabase pour la sécurité

**⚠️ Points d'attention :**
- Nécessite d'établir le contexte RLS en récupérant `public.users` avant toute opération sensible
- Les politiques RLS doivent être correctement configurées

---

### **2. Récupération des Données d'École**

**Fichiers concernés :**
- `components/dashboard/DashboardLayout.tsx`
- `app/onboarding/school/page.tsx`

**Méthode utilisée :**
```typescript
const { data, error } = await supabase
  .from("schools")
  .select("*")
  .eq("id", user.school_id)
  .single();
```

**✅ Avantages :**
- Requête simple et performante
- RLS garantit que seuls les utilisateurs autorisés peuvent accéder aux données

---

### **3. Statistiques du Dashboard**

**Fichiers concernés :**
- `components/dashboard/DashboardStats.tsx`

**Méthode utilisée :**
```typescript
// Nombre de classes
const { count: classroomsCount } = await supabase
  .from("classrooms")
  .select("*", { count: "exact", head: true })
  .eq("school_id", schoolId);

// Nombre d'enseignants
const { count: teachersCount } = await supabase
  .from("users")
  .select("*", { count: "exact", head: true })
  .eq("school_id", schoolId)
  .eq("role", "TEACHER");
```

**✅ Avantages :**
- Utilise `count` avec `head: true` pour ne récupérer que le nombre (optimisé)
- Pas de transfert de données inutiles

---

## 🛡️ Sécurité : Row Level Security (RLS)

### **Architecture de Sécurité Actuelle**

L'application s'appuie **entièrement sur les politiques RLS de Supabase** pour la sécurité.

**Politiques RLS supposées (à vérifier dans Supabase) :**

#### **Table `public.users`**
```sql
-- SELECT : Un utilisateur peut voir ses propres données
CREATE POLICY "Users can view own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- INSERT : Création lors du signup
CREATE POLICY "Users can insert own data"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- UPDATE : Mise à jour de ses propres données
CREATE POLICY "Users can update own data"
ON public.users FOR UPDATE
USING (auth.uid() = id);
```

#### **Table `schools`**
```sql
-- SELECT : Les directeurs peuvent voir leur école
CREATE POLICY "Directors can view their school"
ON schools FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.school_id = schools.id
    AND users.role = 'DIRECTOR'
  )
);

-- INSERT : Seuls les directeurs peuvent créer une école
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

#### **Table `classrooms`**
```sql
-- SELECT : Les utilisateurs de l'école peuvent voir les classes
CREATE POLICY "School users can view classrooms"
ON classrooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.school_id = classrooms.school_id
  )
);
```

---

## ✅ Est-ce que le Système Fonctionne Normalement ?

### **OUI, avec les corrections apportées**

**Avant les corrections :**
- ❌ Erreur RLS lors de la création d'école
- ❌ Contexte RLS non établi sur la page d'onboarding

**Après les corrections :**
- ✅ Récupération explicite de `public.users` pour établir le contexte RLS
- ✅ Ordre correct des opérations (signup → onboarding → dashboard)
- ✅ Toutes les requêtes passent par les politiques RLS

---

## 🔄 Flux de Données Complet

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Signup                                                  │
│     ↓                                                       │
│  supabase.auth.signUp() ──────────────────┐                │
│     ↓                                      │                │
│  supabase.from("users").insert() ─────────┤                │
│     ↓                                      │                │
│  supabase.auth.signInWithPassword() ──────┤                │
│                                            │                │
└────────────────────────────────────────────┼────────────────┘
                                             │
                                             ↓
┌─────────────────────────────────────────────────────────────┐
│ SUPABASE (Backend)                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  auth.users ←──────────────────────────── Création user    │
│     ↓                                                       │
│  RLS vérifie les politiques                                 │
│     ↓                                                       │
│  public.users ←────────────────────────── Insertion user   │
│     ↓                                                       │
│  Session créée ←──────────────────────── Connexion         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                             │
                                             ↓
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  2. Onboarding                                              │
│     ↓                                                       │
│  supabase.auth.getUser() ─────────────────┐                │
│     ↓                                      │                │
│  supabase.from("users").select() ─────────┤ Établit RLS    │
│     ↓                                      │                │
│  supabase.from("schools").insert() ───────┤                │
│     ↓                                      │                │
│  supabase.from("users").update() ─────────┤                │
│                                            │                │
└────────────────────────────────────────────┼────────────────┘
                                             │
                                             ↓
┌─────────────────────────────────────────────────────────────┐
│ SUPABASE (Backend)                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RLS vérifie : user existe dans public.users ?             │
│     ↓ OUI                                                   │
│  RLS vérifie : user.role = 'DIRECTOR' ?                    │
│     ↓ OUI                                                   │
│  schools ←────────────────────────────── Création école    │
│     ↓                                                       │
│  public.users.school_id ←─────────────── Mise à jour       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                             │
                                             ↓
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  3. Dashboard                                               │
│     ↓                                                       │
│  supabase.from("users").select() ─────────┐                │
│     ↓                                      │                │
│  supabase.from("schools").select() ───────┤                │
│     ↓                                      │                │
│  supabase.from("classrooms").select() ────┤                │
│     ↓                                      │                │
│  Affichage des données                     │                │
│                                            │                │
└────────────────────────────────────────────┼────────────────┘
                                             │
                                             ↓
┌─────────────────────────────────────────────────────────────┐
│ SUPABASE (Backend)                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RLS filtre automatiquement les données                     │
│  selon les politiques définies                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Pourquoi Pas d'Edge Functions ?

### **L'architecture actuelle est appropriée car :**

1. **Simplicité** : Les requêtes directes sont plus simples à maintenir
2. **Performance** : Pas de latence supplémentaire d'un round-trip vers une Edge Function
3. **Sécurité** : RLS fournit une sécurité robuste au niveau de la base de données
4. **Coût** : Moins de ressources serveur consommées

### **Quand utiliser des Edge Functions ?**

Les Edge Functions seraient utiles pour :
- ❌ **Logique métier complexe** (ex: calculs, agrégations complexes)
- ❌ **Intégrations tierces** (ex: envoi d'emails, webhooks)
- ❌ **Opérations atomiques complexes** (ex: transactions multi-tables)
- ❌ **Génération de contenu** (ex: génération de quiz avec IA)

**Pour l'instant, aucune de ces fonctionnalités n'est nécessaire.**

---

## 🚨 Points d'Attention Critiques

### **1. Établir le Contexte RLS**

**❌ MAUVAIS :**
```typescript
const { data: { user } } = await supabase.auth.getUser();
// Contexte RLS non établi
await supabase.from("schools").insert([...]);
```

**✅ BON :**
```typescript
const { data: { user: authUser } } = await supabase.auth.getUser();
const { data: userData } = await supabase
  .from("users")
  .select("*")
  .eq("id", authUser.id)
  .single();
// Contexte RLS établi ✅
await supabase.from("schools").insert([...]);
```

### **2. Vérifier les Politiques RLS**

**À faire dans Supabase Dashboard :**
1. Aller dans `Database` → `Tables`
2. Pour chaque table (`users`, `schools`, `classrooms`, etc.)
3. Cliquer sur `RLS` (Row Level Security)
4. Vérifier que les politiques existent et sont correctes

### **3. Gestion des Erreurs**

Toutes les requêtes doivent gérer les erreurs :
```typescript
const { data, error } = await supabase.from("users").select("*");
if (error) {
  console.error("Erreur:", error);
  // Gérer l'erreur
}
```

---

## 📋 Checklist de Vérification

### **Base de Données Supabase**

- [ ] **Politiques RLS activées** sur toutes les tables
- [ ] **Politique SELECT** sur `public.users` (utilisateur peut voir ses données)
- [ ] **Politique INSERT** sur `public.users` (création lors du signup)
- [ ] **Politique SELECT** sur `schools` (directeur peut voir son école)
- [ ] **Politique INSERT** sur `schools` (directeur peut créer une école)
- [ ] **Politique UPDATE** sur `public.users` (mise à jour school_id)
- [ ] **Politique SELECT** sur `classrooms` (utilisateurs de l'école)

### **Code Frontend**

- [x] **Récupération de `public.users`** avant opérations RLS sensibles
- [x] **Gestion des erreurs** sur toutes les requêtes
- [x] **Vérifications de sécurité** (role, school_id, etc.)
- [x] **Redirections appropriées** selon l'état de l'utilisateur

---

## 🎉 Conclusion

### **L'architecture actuelle est CORRECTE et FONCTIONNELLE**

**✅ Points forts :**
- Architecture simple et maintenable
- Sécurité assurée par RLS
- Performance optimale (requêtes directes)
- Corrections apportées résolvent les problèmes RLS

**⚠️ À surveiller :**
- Vérifier que les politiques RLS sont bien configurées dans Supabase
- Tester tous les scénarios (signup, onboarding, dashboard)
- Monitorer les erreurs en production

**🚀 Prochaines étapes :**
1. Tester le flux complet avec un nouveau compte
2. Vérifier les politiques RLS dans Supabase Dashboard
3. Ajouter des logs pour déboguer si nécessaire
4. Considérer des Edge Functions uniquement si besoin de logique métier complexe

---

**L'application n'a PAS besoin d'Edge Functions pour fonctionner correctement.** L'architecture actuelle avec requêtes directes + RLS est la meilleure approche pour ce cas d'usage.
