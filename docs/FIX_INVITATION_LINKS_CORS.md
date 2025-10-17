# Fix CORS - Fonctions Edge d'invitation

## Problème identifié

Les fonctions Edge `generate_invitation_link` et `revoke_invitation_link` retournaient une erreur 401 lors des requêtes OPTIONS (preflight CORS), bloquant ainsi les appels depuis le navigateur.

### Symptômes
- Message d'erreur CORS dans la console du navigateur
- Impossible de créer des liens d'invitation depuis le dashboard
- Les logs Supabase montraient : `OPTIONS | 401` pour `generate_invitation_link`

### Cause
Les fonctions ne géraient pas les requêtes OPTIONS envoyées par le navigateur avant la requête POST réelle (preflight CORS). Elles tentaient de vérifier l'authentification même pour les requêtes OPTIONS, ce qui échouait.

## Solution appliquée

### Modifications apportées

1. **Ajout des headers CORS** dans les deux fonctions :
```typescript
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
```

2. **Gestion des requêtes OPTIONS** au début de chaque fonction :
```typescript
if (req.method === "OPTIONS") {
  return new Response("ok", {
    status: 200,
    headers: CORS_HEADERS
  });
}
```

3. **Ajout des headers CORS à toutes les réponses** :
```typescript
headers: {
  "Content-Type": "application/json",
  ...CORS_HEADERS
}
```

### Fonctions corrigées

- ✅ `generate_invitation_link` (version 3)
- ✅ `revoke_invitation_link` (version 3)

## Test de validation

Pour tester la correction :

1. Se connecter avec un compte directeur (ex: director27@gmail.com)
2. Accéder à une classe existante
3. Cliquer sur "Créer un nouveau lien" dans la section "Liens d'invitation"
4. Vérifier que le lien est créé sans erreur CORS

## Logs de déploiement

- `generate_invitation_link` : Déployée le 2025-01-17 à 15:03 UTC
- `revoke_invitation_link` : Déployée le 2025-01-17 à 15:03 UTC

## Prévention

Pour éviter ce problème à l'avenir, toutes les nouvelles fonctions Edge doivent :

1. Inclure la constante `CORS_HEADERS`
2. Gérer les requêtes OPTIONS en premier
3. Ajouter `...CORS_HEADERS` à toutes les réponses

### Template de fonction Edge avec CORS

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req) => {
  // Gestion CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: CORS_HEADERS
    });
  }

  try {
    // ... logique de la fonction ...
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS
      }
    });
  }
});
```

## Références

- Fonction de référence : `director_create_classroom` (déjà conforme CORS)
- Documentation Supabase Edge Functions : https://supabase.com/docs/guides/functions
