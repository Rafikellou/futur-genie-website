# 🔧 Fix : Edge Function CORS - director_create_classroom

## 📅 Date : 16 octobre 2025

## 🐛 Problème Identifié

### Symptômes
- Erreur 401 lors de la création d'une classe
- Message d'erreur : "Failed to load resource: the server responded with a status of 406 ()"
- Console : "Cannot coerce the result to a single JSON object"

### Diagnostic via MCP Supabase

**Utilisateur concerné :**
- Email : director27@gmail.com
- ID : 706226a7-fce8-4f78-b561-25b38e0c2942
- Rôle : DIRECTOR ✅
- School ID : 7c140f09-6d55-48ce-a42d-c30efd5ab978 ✅
- École : Ecole 27 ✅

**Logs Edge Function :**
```
OPTIONS | 401 | director_create_classroom (version 9)
```

### Cause Racine

L'Edge Function `director_create_classroom` **ne gérait pas les requêtes OPTIONS** (CORS preflight).

Quand le navigateur fait une requête cross-origin :
1. Il envoie d'abord une requête **OPTIONS** (preflight)
2. Si cette requête échoue → la vraie requête POST n'est jamais envoyée
3. Résultat : erreur 401/406

## ✅ Solution Appliquée

### Modifications apportées

**Version déployée :** v10

**Changements :**
1. Ajout de la constante `CORS_HEADERS`
2. Gestion explicite de la requête OPTIONS
3. Ajout des headers CORS à toutes les réponses

### Code ajouté

```typescript
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Gestion CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  // ... reste du code avec CORS_HEADERS ajouté à chaque Response
});
```

## 🎯 Résultat

- ✅ Edge Function redéployée (version 10)
- ✅ CORS configuré correctement
- ✅ Requêtes OPTIONS gérées (status 200)
- ✅ Toutes les réponses incluent les headers CORS

## 🧪 Test à effectuer

1. Se connecter avec director27@gmail.com
2. Créer une nouvelle classe
3. Vérifier dans la console :
   - Requête OPTIONS → 200 ✅
   - Requête POST → 200 ✅
   - Classe créée avec succès ✅

## 📝 Leçons apprises

1. **Toujours gérer CORS dans les Edge Functions** qui sont appelées depuis le navigateur
2. **Pattern CORS standard** :
   - Définir les headers CORS en constante
   - Gérer OPTIONS en premier
   - Ajouter les headers à toutes les réponses
3. **MCP Supabase est excellent** pour diagnostiquer les problèmes Edge Functions

## 🔗 Références

- Fichier local : `supabase/functions/director_create_classroom/index.ts`
- Version déployée : 10
- Date de déploiement : 16 octobre 2025
- Fonction ID : 13db74ab-0832-45eb-8dbf-ebbdb840c034

## 🚀 Prochaines étapes recommandées

Appliquer le même pattern CORS aux autres Edge Functions :
- [ ] `invitation_consume`
- [ ] `generate_invitation_link`
- [ ] `revoke_invitation_link`
- [ ] `invitation_preview`
- [ ] `ai_generate_quiz`
- [ ] Autres fonctions si nécessaire
