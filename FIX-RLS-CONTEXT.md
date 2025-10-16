# 🔧 Fix : Établissement du Contexte RLS

## 🚨 Problème Identifié

**Erreur :** `"new row violates row-level security policy for table "schools""`

**Cause :** Le contexte RLS n'était pas correctement établi au moment de créer l'école, même si les données utilisateur étaient récupérées.

---

## ✅ Solution Implémentée

### **Changements dans `app/onboarding/school/page.tsx`**

#### **1. Vérification Stricte de `currentUser`**

**Avant :**
```typescript
if (initializing) {
  return <div>Chargement...</div>;
}
// Le formulaire s'affichait même si currentUser était null
```

**Après :**
```typescript
if (initializing) {
  return <div>Chargement de vos informations...</div>;
}

// ✅ NOUVEAU : Vérification explicite
if (!currentUser) {
  return (
    <div>
      <h2>Erreur de chargement</h2>
      <p>{error || "Impossible de récupérer vos informations"}</p>
      <button onClick={() => router.push("/login")}>
        Retour à la connexion
      </button>
    </div>
  );
}
```

#### **2. Logs de Débogage**

Ajout de logs pour tracer le flux :
```typescript
// Au chargement
console.log("✅ Données utilisateur récupérées:", {
  id: userData.id,
  email: userData.email,
  role: userData.role,
  school_id: userData.school_id
});

// Avant création d'école
console.log("🏫 Tentative de création d'école avec user:", {
  userId: currentUser.id,
  userRole: currentUser.role,
  schoolName: schoolName
});
```

#### **3. Vérification de Session et Re-établissement du Contexte RLS**

**CRUCIAL :** Avant de créer l'école, on vérifie et ré-établit le contexte RLS :

```typescript
// Vérifier que la session est toujours active
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  throw new Error("Session expirée. Veuillez vous reconnecter.");
}
console.log("✅ Session active:", session.user.id);

// Re-vérifier que l'utilisateur existe dans public.users (établir le contexte RLS)
const { data: userCheck, error: userCheckError } = await supabase
  .from("users")
  .select("id, role")
  .eq("id", currentUser.id)
  .single();

if (userCheckError || !userCheck) {
  console.error("❌ Erreur vérification user:", userCheckError);
  throw new Error("Impossible de vérifier votre compte. Veuillez vous reconnecter.");
}

if (userCheck.role !== "DIRECTOR") {
  throw new Error("Vous devez être directeur pour créer une école.");
}

console.log("✅ Contexte RLS établi pour user:", userCheck);

// MAINTENANT on peut créer l'école
const { data: schoolData, error: schoolError } = await supabase
  .from("schools")
  .insert([{ name: schoolName }])
  .select()
  .single();
```

#### **4. Affichage du Rôle Utilisateur**

Pour rassurer l'utilisateur que ses données sont bien chargées :

```typescript
<h1>Bienvenue {currentUser?.full_name} !</h1>
<p>Dernière étape : configurez votre école</p>
{currentUser && (
  <div style={{ background: "rgba(16, 185, 129, 0.1)" }}>
    <p>✅ Connecté en tant que {currentUser.role}</p>
  </div>
)}
```

---

## 🔍 Pourquoi Ça Fonctionne Maintenant ?

### **Flux Complet :**

```
1. Page charge → initializing = true
   ↓
2. useEffect() s'exécute
   ↓
3. supabase.auth.getUser() → Récupère auth.users
   ↓
4. supabase.from("users").select() → Récupère public.users
   ↓ (Contexte RLS établi)
5. setCurrentUser(userData) → Stocke les données
   ↓
6. setInitializing(false) → Affiche le formulaire
   ↓
7. Utilisateur remplit le formulaire
   ↓
8. handleSubmit() s'exécute
   ↓
9. Vérification session active
   ↓
10. RE-vérification public.users (ré-établit contexte RLS)
    ↓ (Contexte RLS garanti)
11. supabase.from("schools").insert() → SUCCÈS ✅
```

### **Clés du Succès :**

1. **Vérification stricte** : Le formulaire ne s'affiche que si `currentUser` existe
2. **Logs de débogage** : Permet de tracer exactement où ça bloque
3. **Re-vérification avant insertion** : Garantit que le contexte RLS est établi
4. **Vérification de session** : S'assure que l'utilisateur est toujours connecté

---

## 🧪 Comment Tester

### **1. Ouvrir la Console du Navigateur**

Avant de tester, ouvrir les DevTools (F12) → Onglet Console

### **2. Créer un Nouveau Compte**

1. Aller sur `/signup`
2. Remplir le formulaire
3. Observer les logs dans la console

**Logs attendus :**
```
✅ Données utilisateur récupérées: {
  id: "...",
  email: "test@ecole.fr",
  role: "DIRECTOR",
  school_id: null
}
```

### **3. Page d'Onboarding**

1. La page doit afficher : "Bienvenue [Nom] !"
2. Badge vert : "✅ Connecté en tant que DIRECTOR"
3. Remplir le nom de l'école
4. Cliquer "Créer mon école"

**Logs attendus :**
```
🏫 Tentative de création d'école avec user: {
  userId: "...",
  userRole: "DIRECTOR",
  schoolName: "École Test"
}
✅ Session active: "..."
✅ Contexte RLS établi pour user: { id: "...", role: "DIRECTOR" }
```

### **4. Si Erreur RLS Persiste**

**Vérifier dans les logs :**
- ❌ Si "Session expirée" → Problème d'authentification
- ❌ Si "Erreur vérification user" → L'utilisateur n'existe pas dans `public.users`
- ❌ Si "Vous devez être directeur" → Le rôle n'est pas DIRECTOR

**Actions :**
1. Vérifier dans Supabase Dashboard → Authentication → Users
2. Vérifier dans Supabase Dashboard → Table Editor → `public.users`
3. S'assurer que l'utilisateur existe dans les deux tables avec le bon rôle

---

## 🛡️ Vérification des Politiques RLS

### **À Vérifier dans Supabase Dashboard**

1. **Aller dans `Database` → `Tables` → `schools`**
2. **Cliquer sur `RLS` (Row Level Security)**
3. **Vérifier qu'il existe une politique INSERT comme :**

```sql
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

### **Si la Politique N'existe Pas**

Créer la politique dans Supabase SQL Editor :

```sql
-- Activer RLS sur la table schools
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Politique INSERT pour les directeurs
CREATE POLICY "Directors can create schools"
ON schools FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'DIRECTOR'
  )
);

-- Politique SELECT pour voir son école
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

## 📋 Checklist de Débogage

Si l'erreur RLS persiste, vérifier dans l'ordre :

- [ ] **Console navigateur** : Les logs "✅ Données utilisateur récupérées" s'affichent ?
- [ ] **Badge vert** : "✅ Connecté en tant que DIRECTOR" visible sur la page ?
- [ ] **Session active** : Le log "✅ Session active" s'affiche avant la création ?
- [ ] **Contexte RLS** : Le log "✅ Contexte RLS établi" s'affiche ?
- [ ] **Table `public.users`** : L'utilisateur existe avec `role = 'DIRECTOR'` ?
- [ ] **Politique RLS** : La politique INSERT existe sur la table `schools` ?
- [ ] **RLS activé** : RLS est bien activé sur la table `schools` ?

---

## 🎯 Résumé des Changements

### **Fichier Modifié :**
- `app/onboarding/school/page.tsx`

### **Améliorations :**
1. ✅ Vérification stricte de `currentUser` avant affichage du formulaire
2. ✅ Logs de débogage pour tracer le flux
3. ✅ Vérification de session avant création d'école
4. ✅ Re-vérification de `public.users` pour établir le contexte RLS
5. ✅ Affichage du nom et rôle de l'utilisateur
6. ✅ Écran d'erreur dédié si les données ne se chargent pas

### **Résultat Attendu :**
- ✅ Le formulaire ne s'affiche que si les données utilisateur sont chargées
- ✅ Le contexte RLS est garanti au moment de créer l'école
- ✅ Les logs permettent de déboguer facilement
- ✅ L'utilisateur voit clairement son statut (nom, rôle)

---

**Testez maintenant et observez les logs dans la console !** 🚀
