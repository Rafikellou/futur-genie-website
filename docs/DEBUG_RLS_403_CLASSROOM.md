# 🔧 Debug : Erreur 403 lors de la création de classe (Director avec school_id)

## 🐛 Symptôme Spécifique

**Utilisateur :** `director26@gmaiml.com`
**Problème :** Erreur 403 lors de la création de classe
**Contexte :** L'utilisateur **a bien un `school_id`** dans `public.users`

```
❌ Error: new row violates row-level security policy for table "classrooms"
Status: 403 (Forbidden)
```

---

## 🔍 Hypothèses à Vérifier

### Hypothèse 1 : Politiques RLS Incorrectes ou Manquantes

**Problème possible :** Les politiques RLS dans Supabase ne correspondent pas au fichier `supabase-rls-policies.sql`

**Vérification :**
1. Ouvrir **Supabase Dashboard** → **Authentication** → **Policies**
2. Vérifier la table `classrooms`
3. Chercher la politique : `"Directors can create classrooms"`

**Politique attendue :**
```sql
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

**Problèmes possibles :**
- ❌ La politique n'existe pas
- ❌ La politique utilise `USING` au lieu de `WITH CHECK`
- ❌ La politique utilise des fonctions helper (`app.is_role()`, `app.same_school()`) qui n'existent pas
- ❌ La politique a une condition différente

---

### Hypothèse 2 : Conflit avec d'Autres Politiques

**Problème possible :** Il existe plusieurs politiques sur `classrooms` qui se contredisent

**Vérification :**
```sql
-- Lister toutes les politiques sur classrooms
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'classrooms';
```

**Problèmes possibles :**
- ❌ Plusieurs politiques INSERT qui se contredisent
- ❌ Une politique trop restrictive qui bloque tout
- ❌ Une politique avec `USING` qui empêche l'insertion

---

### Hypothèse 3 : Contexte RLS Non Établi

**Problème possible :** Le contexte RLS n'est pas correctement établi côté client

**Vérification :**
1. Vérifier que `useAuth()` récupère bien `public.users`
2. Vérifier que la session Supabase est active
3. Vérifier que `auth.uid()` retourne le bon ID

**Code à vérifier :**
```typescript
// Dans useAuth.ts (lignes 51-55)
const { data: userData, error } = await supabase
  .from("users")
  .select("*")
  .eq("id", authUser.id)
  .single();
```

**Test :**
Ajouter des logs dans `CreateClassroomModal.tsx` :
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 🔍 DEBUG : Vérifier les données avant insertion
  const { data: { user: authUser } } = await supabase.auth.getUser();
  console.log("🔍 Auth User:", authUser?.id);
  
  const { data: publicUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser?.id)
    .single();
  console.log("🔍 Public User:", publicUser);
  console.log("🔍 School ID passé au modal:", schoolId);
  console.log("🔍 School ID de l'utilisateur:", publicUser?.school_id);
  console.log("🔍 Correspondent-ils ?", schoolId === publicUser?.school_id);
  
  // ... reste du code
};
```

---

### Hypothèse 4 : `school_id` Passé au Modal est Différent

**Problème possible :** Le `school_id` passé au modal ne correspond pas au `school_id` de l'utilisateur

**Vérification :**
```typescript
// Dans app/dashboard/classes/page.tsx (ligne 38)
<ClassroomsList schoolId={user.school_id!} userId={user.id} />
```

**Problèmes possibles :**
- ❌ `user.school_id` est `null` ou `undefined`
- ❌ `user.school_id` est un UUID différent de celui dans la base
- ❌ Le `!` force TypeScript à ignorer le null, mais la valeur est quand même null

**Test :**
Ajouter un log dans `ClassroomsList.tsx` :
```typescript
useEffect(() => {
  console.log("🔍 School ID reçu par ClassroomsList:", schoolId);
  console.log("🔍 Type:", typeof schoolId);
  console.log("🔍 Est null/undefined ?", schoolId == null);
  loadClassrooms();
}, [schoolId]);
```

---

### Hypothèse 5 : Session Expirée ou Token Invalide

**Problème possible :** La session Supabase est expirée ou le token JWT est invalide

**Vérification :**
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log("🔍 Session:", session);
console.log("🔍 Token expires at:", new Date(session?.expires_at * 1000));
```

**Solution :**
```typescript
// Rafraîchir la session avant l'insertion
const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
if (sessionError) {
  console.error("Erreur de rafraîchissement:", sessionError);
  throw new Error("Session expirée. Veuillez vous reconnecter.");
}
```

---

### Hypothèse 6 : Problème de Type UUID

**Problème possible :** Le `school_id` est une string mais la base attend un UUID

**Vérification :**
```sql
-- Vérifier le type de la colonne
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'classrooms'
  AND column_name = 'school_id';
```

**Solution :**
Si le type est `uuid`, s'assurer que la valeur est bien un UUID valide :
```typescript
// Valider le UUID avant insertion
const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(schoolId);
console.log("🔍 UUID valide ?", isValidUUID);
```

---

## 🛠️ Plan de Debug Étape par Étape

### Étape 1 : Vérifier les Politiques RLS dans Supabase

1. Ouvrir **Supabase Dashboard**
2. Aller dans **Database** → **Policies**
3. Sélectionner la table `classrooms`
4. Vérifier les politiques INSERT
5. Comparer avec `supabase-rls-policies.sql`

**Si les politiques sont différentes :**
- Supprimer les anciennes politiques
- Exécuter le script `supabase-rls-policies.sql` (lignes 75-99)

### Étape 2 : Exécuter le Script de Vérification SQL

1. Ouvrir **Supabase Dashboard** → **SQL Editor**
2. Copier le contenu de `verify-rls-policies.sql`
3. Remplacer `'director26@gmaiml.com'` par l'email du Director
4. Exécuter le script
5. Analyser les résultats

**Résultats attendus :**
- ✅ RLS activé sur `classrooms`
- ✅ Politique `"Directors can create classrooms"` existe
- ✅ `user.school_id` n'est pas NULL
- ✅ `user.school_id` correspond à l'école
- ✅ Simulation RLS : "LA POLITIQUE RLS DEVRAIT PASSER"

### Étape 3 : Ajouter des Logs de Debug

Modifier `CreateClassroomModal.tsx` pour ajouter des logs détaillés :

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // 🔍 DEBUG : Vérifier le contexte
    console.log("=== DEBUG CRÉATION CLASSE ===");
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    console.log("1. Auth User ID:", authUser?.id);
    
    const { data: publicUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser?.id)
      .single();
    console.log("2. Public User:", publicUser);
    console.log("3. School ID utilisateur:", publicUser?.school_id);
    console.log("4. School ID modal:", schoolId);
    console.log("5. Correspondent ?", schoolId === publicUser?.school_id);
    console.log("6. Role:", publicUser?.role);
    
    const { data: { session } } = await supabase.auth.getSession();
    console.log("7. Session valide ?", !!session);
    console.log("8. Session expire à:", session ? new Date(session.expires_at * 1000) : "N/A");
    
    console.log("9. Tentative d'insertion avec:", {
      name,
      grade,
      school_id: schoolId
    });

    const { error: insertError } = await supabase
      .from("classrooms")
      .insert([
        {
          name,
          grade,
          school_id: schoolId,
        },
      ]);

    if (insertError) {
      console.error("10. Erreur d'insertion:", insertError);
      throw insertError;
    }
    
    console.log("11. ✅ Insertion réussie !");
    onCreated();
  } catch (err) {
    console.error("12. ❌ Erreur finale:", err);
    const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création";
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

### Étape 4 : Reproduire l'Erreur et Analyser les Logs

1. Se connecter avec `director26@gmaiml.com`
2. Aller sur `/dashboard/classes`
3. Cliquer sur "Créer une classe"
4. Remplir le formulaire
5. Cliquer sur "Créer"
6. **Ouvrir la console du navigateur** (F12)
7. Analyser les logs

**Logs attendus si tout est OK :**
```
=== DEBUG CRÉATION CLASSE ===
1. Auth User ID: "uuid-123"
2. Public User: { id: "uuid-123", role: "DIRECTOR", school_id: "school-uuid", ... }
3. School ID utilisateur: "school-uuid"
4. School ID modal: "school-uuid"
5. Correspondent ? true
6. Role: "DIRECTOR"
7. Session valide ? true
8. Session expire à: [date future]
9. Tentative d'insertion avec: { name: "Test", grade: "CP", school_id: "school-uuid" }
11. ✅ Insertion réussie !
```

**Logs si erreur :**
```
10. Erreur d'insertion: { code: "42501", message: "new row violates row-level security policy..." }
```

### Étape 5 : Analyser les Résultats

**Si `schoolId === publicUser?.school_id` est `false` :**
→ Le problème vient du passage du `school_id` au modal

**Si `schoolId === publicUser?.school_id` est `true` mais erreur 403 :**
→ Le problème vient des politiques RLS dans Supabase

**Si la session est expirée :**
→ Ajouter un rafraîchissement de session avant l'insertion

---

## 🔧 Solutions Possibles

### Solution 1 : Réappliquer les Politiques RLS

```sql
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Directors can create classrooms" ON classrooms;
DROP POLICY IF EXISTS "p_classrooms_director_insert" ON classrooms;

-- Recréer la bonne politique
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

### Solution 2 : Rafraîchir la Session Avant Insertion

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // Rafraîchir la session
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
    if (sessionError || !session) {
      throw new Error("Session expirée. Veuillez vous reconnecter.");
    }

    // Récupérer les données utilisateur fraîches
    const { data: publicUser } = await supabase
      .from("users")
      .select("school_id")
      .eq("id", session.user.id)
      .single();

    // Utiliser le school_id de l'utilisateur (pas celui passé en prop)
    const { error: insertError } = await supabase
      .from("classrooms")
      .insert([
        {
          name,
          grade,
          school_id: publicUser?.school_id, // ← Utiliser le school_id frais
        },
      ]);

    if (insertError) throw insertError;
    onCreated();
  } catch (err) {
    console.error("Erreur de création:", err);
    const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création";
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

### Solution 3 : Utiliser une Edge Function (Bypass RLS)

Créer une Edge Function qui insère la classe avec les privilèges élevés :

```typescript
// supabase/functions/create-classroom/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const { name, grade } = await req.json()
  
  const authHeader = req.headers.get('Authorization')!
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // ← Service role bypass RLS
    { global: { headers: { Authorization: authHeader } } }
  )

  // Récupérer l'utilisateur
  const { data: { user } } = await supabaseClient.auth.getUser()
  
  const { data: publicUser } = await supabaseClient
    .from('users')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  // Vérifier le rôle
  if (publicUser.role !== 'DIRECTOR') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
  }

  // Insérer la classe (bypass RLS avec service role)
  const { data, error } = await supabaseClient
    .from('classrooms')
    .insert([{ name, grade, school_id: publicUser.school_id }])
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ data }), { status: 200 })
})
```

---

## 📊 Checklist de Vérification

- [ ] RLS activé sur `classrooms`
- [ ] Politique `"Directors can create classrooms"` existe
- [ ] Politique utilise `WITH CHECK` (pas `USING`)
- [ ] Pas de fonctions helper manquantes (`app.is_role()`, etc.)
- [ ] `user.school_id` n'est pas NULL
- [ ] `user.school_id` correspond à l'école
- [ ] Session Supabase valide et non expirée
- [ ] `schoolId` passé au modal est correct
- [ ] Logs de debug ajoutés et analysés
- [ ] Test avec un nouvel utilisateur Director

---

## 📞 Prochaines Étapes

1. **Exécuter `verify-rls-policies.sql`** pour diagnostiquer
2. **Ajouter les logs de debug** dans `CreateClassroomModal.tsx`
3. **Reproduire l'erreur** et analyser les logs console
4. **Appliquer la solution** en fonction des résultats

---

**Fichiers créés pour le debug :**
- `verify-rls-policies.sql` : Script de vérification SQL
- `docs/DEBUG_RLS_403_CLASSROOM.md` : Ce document
