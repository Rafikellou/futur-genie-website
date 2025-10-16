# 🔍 Analyse Priorité 2 - RLS Policy Schools & Fonctions Helper

## 📅 Date : 16 octobre 2025

---

## 🎯 Contexte Historique

### **Problème Initial : CORS/OPTIONS sur Edge Functions**

D'après la documentation (`docs/FIX_EDGE_FUNCTION_CORS.md` et `docs/ONBOARDING_DIRECTEUR.md`), voici ce qui s'est passé :

1. **Problème rencontré** : Erreur 401 lors de la création d'école
2. **Cause** : Les requêtes OPTIONS (CORS preflight) échouaient car l'Edge Function nécessitait un JWT
3. **Solution appliquée** : Gérer les requêtes OPTIONS sans authentification dans l'Edge Function

**MAIS** : Le problème CORS était sur les **Edge Functions**, pas sur les **RLS policies** !

---

## 🔍 Analyse de la RLS Policy `p_schools_director_insert`

### **Policy Actuelle**

```sql
CREATE POLICY p_schools_director_insert ON schools
FOR INSERT
WITH CHECK (
  -- Vérification 1 : Dans la table users
  (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'DIRECTOR'::user_role
  ))
  OR
  -- Vérification 2 : Dans user_metadata du JWT
  (COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role')::text
  ) = 'DIRECTOR'::text)
);
```

### **Pourquoi Cette Complexité ?**

D'après `docs/ONBOARDING_DIRECTEUR.md` (lignes 296-300) :

> **Cause** : La politique RLS cherchait le rôle dans `app_metadata` alors qu'il était dans `user_metadata`.
> 
> **Solution** : Utiliser l'Edge Function avec service role key qui bypass le RLS.

**Analyse :**
1. Le rôle était stocké dans `user_metadata` (pas `app_metadata`)
2. La policy a été complexifiée pour vérifier les deux endroits
3. **MAIS** : L'Edge Function `director_onboarding_complete` utilise le **service role key** qui **bypass complètement le RLS** !

---

## 🚨 Constat Critique

### **La Policy Complexe N'est JAMAIS Utilisée !**

**Preuve 1 : L'Edge Function utilise le service role key**

```typescript
// Dans director_onboarding_complete
const serviceClient = createClient(supabaseUrl, serviceKey);

// Cette insertion BYPASS le RLS
const { data: newSchool, error: schoolErr } = await serviceClient
  .from("schools")
  .insert({ name: schoolName })
  .select("id, name, created_at")
  .single();
```

**Preuve 2 : Documentation explicite**

> **Note importante** : Cette politique est contournée par l'Edge Function car elle utilise le `serviceClient` avec la clé service role.
> — `docs/ONBOARDING_DIRECTEUR.md` ligne 290

**Preuve 3 : Aucune insertion directe depuis le client**

J'ai vérifié tout le code :
- ❌ Aucun `supabase.from("schools").insert()` dans le code client
- ✅ Toutes les créations d'école passent par l'Edge Function

---

## 🎯 Conclusion : La Complexité est INUTILE

### **Pourquoi la policy a été complexifiée ?**

1. **Problème initial** : Erreur 401 sur l'Edge Function (CORS OPTIONS)
2. **Mauvais diagnostic** : On a pensé que c'était un problème de RLS
3. **Solution incorrecte** : On a complexifié la RLS policy
4. **Vraie solution** : Gérer CORS dans l'Edge Function (déjà fait)

### **Réalité :**
- Le problème CORS était sur les **Edge Functions** (résolu)
- La RLS policy n'a **jamais été le problème**
- La complexité de la policy est **totalement inutile** car elle est bypassée

---

## 📊 Recommandations

### **Option 1 : Supprimer Complètement la Policy** ⭐ RECOMMANDÉ

**Justification :**
- L'Edge Function utilise le service role key (bypass RLS)
- Aucune insertion directe depuis le client
- La policy ne sert à rien

**Action :**
```sql
-- Supprimer la policy inutile
DROP POLICY IF EXISTS p_schools_director_insert ON schools;
```

**Avantages :**
- ✅ Code plus simple
- ✅ Moins de confusion
- ✅ Pas de maintenance inutile

**Risques :**
- ⚠️ Si un jour on veut permettre l'insertion directe depuis le client, il faudra recréer une policy
- ⚠️ Mais c'est peu probable vu l'architecture actuelle

---

### **Option 2 : Simplifier la Policy (Si On Veut la Garder)**

**Justification :**
- Garder une policy "au cas où"
- Mais la simplifier au maximum

**Action :**
```sql
-- Supprimer l'ancienne
DROP POLICY IF EXISTS p_schools_director_insert ON schools;

-- Créer une policy simple
CREATE POLICY p_schools_director_insert ON schools
FOR INSERT
WITH CHECK (
  -- Vérifier uniquement dans la table users
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'DIRECTOR'::user_role
    AND users.school_id IS NULL  -- Empêcher la création de plusieurs écoles
  )
);
```

**Avantages :**
- ✅ Policy simple et compréhensible
- ✅ Sécurité supplémentaire si insertion directe
- ✅ Empêche un DIRECTOR de créer plusieurs écoles

**Inconvénients :**
- ⚠️ Toujours inutile vu que l'Edge Function bypass le RLS

---

### **Option 3 : Garder la Policy Actuelle** ❌ NON RECOMMANDÉ

**Justification :**
- "Ça marche, on ne touche pas"

**Inconvénients :**
- ❌ Complexité inutile
- ❌ Confusion pour les futurs développeurs
- ❌ Maintenance inutile
- ❌ Fausse impression de sécurité

---

## 🔍 Analyse des Fonctions Helper (Points 3 & 4)

### **Point 3 : Simplifier la RLS policy `p_schools_director_insert`**

**Verdict : ✅ OUI, mais en la SUPPRIMANT (Option 1)**

La policy est inutile car :
- L'Edge Function bypass le RLS avec service role key
- Aucune insertion directe depuis le client
- La complexité ne résout aucun problème réel

---

### **Point 4 : Ajouter fallback DB à `app.current_user_school_id()`**

**Fonction actuelle :**
```sql
CREATE FUNCTION app.current_user_school_id()
RETURNS uuid AS $$
  SELECT app.jwt_claim('school_id')::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

**Problème :**
Si `app_metadata.school_id` n'est pas dans le JWT, la fonction retourne `NULL`, même si `users.school_id` existe dans la DB.

**Solution proposée :**
```sql
CREATE OR REPLACE FUNCTION app.current_user_school_id()
RETURNS uuid AS $$
DECLARE
  sid uuid;
BEGIN
  -- 1) Try JWT claim
  sid := app.jwt_claim('school_id')::uuid;
  
  -- 2) Fallback to DB
  IF sid IS NULL THEN
    SELECT u.school_id INTO sid
    FROM public.users u
    WHERE u.id = app.current_user_id();
  END IF;
  
  RETURN sid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

**Verdict : ✅ OUI, C'EST UTILE**

**Justification :**
- Après la Priorité 1, on a ajouté `refreshSession()` après l'onboarding
- Mais il peut y avoir un délai de propagation du JWT
- Le fallback DB garantit que `current_user_school_id()` retourne toujours la bonne valeur
- Cela améliore la robustesse des RLS policies qui utilisent cette fonction

**Bénéfices :**
- ✅ Élimine les race conditions JWT
- ✅ Garantit que les RLS policies fonctionnent même si le JWT n'est pas à jour
- ✅ Cohérent avec `app.current_user_role()` qui a déjà un fallback DB

---

## 🎯 Plan d'Action Final

### **Priorité 2 Révisée**

| # | Action | Recommandation | Justification |
|---|--------|----------------|---------------|
| 3 | Simplifier RLS policy `p_schools_director_insert` | ✅ **SUPPRIMER** (Option 1) | Policy inutile car Edge Function bypass RLS |
| 4 | Ajouter fallback DB à `app.current_user_school_id()` | ✅ **FAIRE** | Améliore robustesse, élimine race conditions JWT |

---

## 📝 Résumé Exécutif

### **Ce Qu'on a Appris**

1. **Le problème CORS était sur les Edge Functions, pas sur les RLS policies**
   - Résolu en gérant les requêtes OPTIONS dans les Edge Functions
   - La complexification de la RLS policy était une fausse piste

2. **La RLS policy `p_schools_director_insert` est inutile**
   - L'Edge Function utilise le service role key (bypass RLS)
   - Aucune insertion directe depuis le client
   - La complexité ne résout aucun problème réel

3. **Le fallback DB pour `current_user_school_id()` est utile**
   - Élimine les race conditions JWT
   - Garantit la cohérence des RLS policies
   - Améliore la robustesse globale

### **Actions Recommandées**

**✅ À FAIRE :**
1. Supprimer la RLS policy `p_schools_director_insert` (inutile)
2. Ajouter fallback DB à `app.current_user_school_id()` (utile)

**❌ À NE PAS FAIRE :**
- Garder la policy complexe (confusion inutile)
- Simplifier la policy (toujours inutile car bypassée)

---

## 🚀 Prochaines Étapes

Si tu es d'accord avec cette analyse :

1. **Supprimer la RLS policy `p_schools_director_insert`**
   - Créer une migration SQL
   - Documenter la raison de la suppression

2. **Ajouter fallback DB à `app.current_user_school_id()`**
   - Créer une migration SQL
   - Tester avec un user qui vient de créer son école

3. **Nettoyer la documentation**
   - Mettre à jour `docs/ONBOARDING_DIRECTEUR.md`
   - Clarifier que le problème CORS était sur les Edge Functions

---

**Temps estimé : ~30 minutes**

**Fin de l'analyse - Priorité 2**
