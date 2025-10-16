# Documentation : Onboarding Directeur

## Vue d'ensemble

Le processus d'onboarding du directeur permet à un utilisateur de créer un compte, de s'authentifier, et de créer son école dans l'application Futur Génie.

---

## Architecture

### Tables de base de données

#### `auth.users` (Supabase Auth)
- **id** : UUID de l'utilisateur
- **email** : Email de l'utilisateur
- **role** : Toujours `"authenticated"` (rôle Supabase)
- **raw_user_meta_data** : Métadonnées utilisateur
  - `role` : `"DIRECTOR"` (rôle métier)
  - `full_name` : Nom complet
- **raw_app_meta_data** : Métadonnées application
  - `provider` : `"email"`
  - `role` : `"DIRECTOR"` (ajouté après onboarding)
  - `school_id` : UUID de l'école (ajouté après onboarding)

#### `public.users`
- **id** : UUID (FK vers auth.users.id)
- **email** : Email
- **role** : `"DIRECTOR"` (enum user_role)
- **full_name** : Nom complet
- **school_id** : UUID (FK vers schools.id, NULL au départ)
- **created_at** : Timestamp

#### `public.schools`
- **id** : UUID (PK)
- **name** : Nom de l'école
- **created_at** : Timestamp

---

## Flux d'onboarding complet

### Étape 1 : Inscription (`/signup`)

**Fichier** : `components/auth/SignupForm.tsx`

#### Actions
1. L'utilisateur remplit le formulaire :
   - Nom complet
   - Email professionnel
   - Mot de passe (min 8 caractères)

2. Appel à `supabase.auth.signUp()` :
```typescript
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      full_name: formData.fullName,
      role: "DIRECTOR",  // Stocké dans user_metadata
    },
  },
});
```

3. Création du profil dans `public.users` :
```typescript
const { error: userError } = await supabase.from("users").insert([
  {
    id: authData.user.id,
    role: "DIRECTOR",
    school_id: null,  // Sera rempli à l'étape suivante
    email: formData.email,
    full_name: formData.fullName,
  },
]);
```

4. Connexion automatique :
```typescript
await supabase.auth.signInWithPassword({
  email: formData.email,
  password: formData.password,
});
```

5. Redirection vers `/onboarding/school`

#### Résultat
- ✅ Utilisateur créé dans `auth.users`
- ✅ Profil créé dans `public.users` avec `role = 'DIRECTOR'` et `school_id = null`
- ✅ Session active
- ✅ JWT contient `user_metadata.role = 'DIRECTOR'`

---

### Étape 2 : Création de l'école (`/onboarding/school`)

**Fichier** : `app/onboarding/school/page.tsx`

#### Vérifications initiales

1. **Vérification de l'authentification** :
```typescript
const { data: { user: authUser } } = await supabase.auth.getUser();
if (!authUser) {
  router.push("/login");
  return;
}
```

2. **Récupération du profil** :
```typescript
const { data: userData, error: userError } = await supabase
  .from("users")
  .select("*")
  .eq("id", authUser.id)
  .single();
```

3. **Vérification du rôle** :
```typescript
if (userData.role !== "DIRECTOR") {
  router.push("/login");
  return;
}
```

4. **Vérification si l'école existe déjà** :
```typescript
if (userData.school_id) {
  router.push("/dashboard");
  return;
}
```

#### Création de l'école

Lorsque l'utilisateur soumet le formulaire, on appelle l'Edge Function `director_onboarding_complete` :

```typescript
const { data: { session } } = await supabase.auth.getSession();

const { data, error } = await supabase.functions.invoke('director_onboarding_complete', {
  body: {
    schoolName: schoolName,
    fullName: currentUser.full_name
  },
  headers: {
    Authorization: `Bearer ${session.access_token}`  // Token explicite
  }
});
```

#### Résultat
- ✅ École créée dans `public.schools`
- ✅ `public.users.school_id` mis à jour
- ✅ `auth.users.app_metadata` mis à jour avec `role` et `school_id`
- ✅ Redirection vers `/dashboard`

---

## Edge Function : `director_onboarding_complete`

**Emplacement** : Supabase Edge Functions (déployée sur le cloud)

### Configuration
- **verify_jwt** : `true` (nécessite un token JWT valide)
- **Version actuelle** : 3
- **URL** : `https://kytanovmeikekkldcbif.supabase.co/functions/v1/director_onboarding_complete`

### Gestion CORS

La fonction gère les requêtes OPTIONS (preflight) sans authentification :

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

### Logique métier

1. **Vérification de l'authentification** :
```typescript
const authClient = createClient(supabaseUrl, anonKey, {
  global: {
    headers: {
      Authorization: req.headers.get("Authorization") || ""
    }
  }
});

const { data: userRes, error: userErr } = await authClient.auth.getUser();
if (userErr || !userRes?.user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}
```

2. **Création/vérification du profil** (avec service role key) :
```typescript
const serviceClient = createClient(supabaseUrl, serviceKey);

const { data: existingProfile } = await serviceClient
  .from("users")
  .select("id, role, school_id")
  .eq("id", authUser.id)
  .maybeSingle();
```

3. **Création de l'école** (bypass RLS avec service role) :
```typescript
const { data: newSchool, error: schoolErr } = await serviceClient
  .from("schools")
  .insert({ name: schoolName })
  .select("id, name, created_at")
  .single();
```

4. **Liaison école-utilisateur** :
```typescript
await serviceClient
  .from("users")
  .update({ school_id: school.id })
  .eq("id", authUser.id);
```

5. **Mise à jour des métadonnées JWT** :
```typescript
await serviceClient.auth.admin.updateUserById(authUser.id, {
  app_metadata: {
    ...authUser.app_metadata || {},
    role: "DIRECTOR",
    school_id: school.id
  }
});
```

### Réponse

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "role": "DIRECTOR",
    "school_id": "uuid",
    "full_name": "Nom complet"
  },
  "school": {
    "id": "uuid",
    "name": "Nom de l'école",
    "created_at": "timestamp"
  }
}
```

---

## Politiques RLS (Row Level Security)

### Table `schools`

#### Politique INSERT : `p_schools_director_insert`

```sql
CREATE POLICY p_schools_director_insert ON schools
  FOR INSERT
  TO public
  WITH CHECK (
    -- Vérifier dans la table users
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'DIRECTOR'
    )
    -- OU vérifier dans user_metadata du JWT
    OR COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role')::text,
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role')::text
    ) = 'DIRECTOR'
  );
```

**Note importante** : Cette politique est contournée par l'Edge Function car elle utilise le `serviceClient` avec la clé service role.

---

## Problèmes résolus

### 1. Erreur 403 (Forbidden) lors de la création d'école

**Cause** : La politique RLS cherchait le rôle dans `app_metadata` alors qu'il était dans `user_metadata`.

**Solution** : Utiliser l'Edge Function avec service role key qui bypass le RLS.

### 2. Erreur 401 (Unauthorized) sur l'Edge Function

**Cause** : Les requêtes OPTIONS (CORS preflight) nécessitaient un token JWT.

**Solution** : Gérer les requêtes OPTIONS sans authentification dans l'Edge Function.

### 3. Token non transmis à l'Edge Function

**Cause** : Le client Supabase ne transmettait pas automatiquement le token.

**Solution** : Passer explicitement le token dans les headers :
```typescript
headers: {
  Authorization: `Bearer ${session.access_token}`
}
```

---

## Intégration iOS

### Utilisation de l'Edge Function depuis iOS

```swift
// Swift example
let supabase = SupabaseClient(
    supabaseURL: URL(string: "https://kytanovmeikekkldcbif.supabase.co")!,
    supabaseKey: "your-anon-key"
)

// Récupérer la session
let session = try await supabase.auth.session

// Appeler l'Edge Function
let response = try await supabase.functions.invoke(
    "director_onboarding_complete",
    options: FunctionInvokeOptions(
        headers: ["Authorization": "Bearer \(session.accessToken)"],
        body: [
            "schoolName": "École primaire Victor Hugo",
            "fullName": "Jean Dupont"
        ]
    )
)
```

### Points d'attention iOS

1. **Session persistante** : Assurez-vous que la session est bien sauvegardée localement
2. **Token refresh** : Gérer le rafraîchissement automatique du token
3. **Gestion d'erreurs** : Gérer les erreurs 401 (token expiré) et 403 (permissions)

---

## Diagramme de séquence

```
Utilisateur                Frontend              Supabase Auth        Edge Function        Database
    |                         |                         |                    |                  |
    |-- Inscription --------->|                         |                    |                  |
    |                         |-- signUp() ------------>|                    |                  |
    |                         |<-- user created --------|                    |                  |
    |                         |-- insert users ---------|--------------------|--> public.users  |
    |                         |-- signIn() ------------>|                    |                  |
    |                         |<-- session + JWT -------|                    |                  |
    |                         |                         |                    |                  |
    |<-- Redirect /onboarding/school                    |                    |                  |
    |                         |                         |                    |                  |
    |-- Créer école --------->|                         |                    |                  |
    |                         |-- invoke Edge Function -|--------------------|--> OPTIONS (200) |
    |                         |-- invoke Edge Function -|--------------------|--> POST          |
    |                         |                         |                    |-- verify JWT --->|
    |                         |                         |                    |<-- user data ----|
    |                         |                         |                    |-- insert school->|
    |                         |                         |                    |-- update user -->|
    |                         |                         |                    |-- update JWT --->|
    |                         |<-- success + school data|<-------------------|                  |
    |<-- Redirect /dashboard  |                         |                    |                  |
```

---

## Variables d'environnement requises

### Frontend (Vercel/Next.js)
```env
NEXT_PUBLIC_SUPABASE_URL=https://kytanovmeikekkldcbif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Edge Function (Supabase)
```env
SUPABASE_URL=https://kytanovmeikekkldcbif.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Tests recommandés

### Test 1 : Inscription complète
1. Créer un nouveau compte avec email unique
2. Vérifier la redirection vers `/onboarding/school`
3. Vérifier que le profil existe dans `public.users`

### Test 2 : Création d'école
1. Entrer le nom de l'école
2. Soumettre le formulaire
3. Vérifier la création dans `public.schools`
4. Vérifier la liaison dans `public.users.school_id`
5. Vérifier la redirection vers `/dashboard`

### Test 3 : Gestion d'erreurs
1. Tenter de créer une école sans être connecté → 401
2. Tenter de créer une école avec un rôle non-DIRECTOR → 403
3. Tenter de créer une école avec un nom vide → 400

---

## Maintenance

### Mise à jour de l'Edge Function

Pour déployer une nouvelle version de l'Edge Function :

```typescript
// Utiliser le MCP Supabase
await mcp0_deploy_edge_function({
  project_id: "kytanovmeikekkldcbif",
  name: "director_onboarding_complete",
  entrypoint_path: "index.ts",
  files: [{ name: "index.ts", content: "..." }]
});
```

### Logs et debugging

```typescript
// Récupérer les logs de l'Edge Function
await mcp0_get_logs({
  project_id: "kytanovmeikekkldcbif",
  service: "edge-function"
});
```

---

## Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Edge Functions](https://supabase.com/docs/guides/functions)
- [Documentation RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase iOS SDK](https://github.com/supabase-community/supabase-swift)

---

**Dernière mise à jour** : 16 octobre 2025
**Version** : 1.0
**Auteur** : Cascade AI Assistant
