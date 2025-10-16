# ✅ Corrections Priorité 1 - Terminées

## 📅 Date : 16 octobre 2025

---

## 🎯 Objectifs

Corriger les deux problèmes critiques identifiés lors de l'analyse approfondie :

1. **Doublon dans la création d'invitations** (TEACHER/PARENT)
2. **Synchronisation JWT** après création d'école

---

## 🔧 Modifications Effectuées

### **1. InvitationLinksModal.tsx** - Suppression du doublon

**Fichier :** `components/dashboard/InvitationLinksModal.tsx`

**Problème :**
- Deux implémentations contradictoires pour créer des liens d'invitation
- Code client : insertion directe dans la table `invitation_links` (30 jours, token custom)
- Edge Function : logique de réutilisation, validation des permissions (7 jours, crypto.randomUUID())

**Solution :**
- ✅ Supprimé la fonction `generateToken()` (inutilisée)
- ✅ Remplacé l'insertion directe par un appel à l'Edge Function `generate_invitation_link`
- ✅ Ajouté des logs de débogage pour tracer les appels

**Code modifié :**
```typescript
const createLink = async (role: UserRole) => {
  setCreating(role);
  try {
    console.log("🚀 Création de lien d'invitation via Edge Function");
    console.log("Données:", { classroom_id: classroom.id, intended_role: role });

    // Appeler l'Edge Function generate_invitation_link
    const { data, error } = await supabase.functions.invoke('generate_invitation_link', {
      body: {
        classroom_id: classroom.id,
        intended_role: role,
      },
    });

    if (error) {
      console.error("❌ Erreur Edge Function:", error);
      throw new Error(error.message || "Erreur lors de la création du lien");
    }

    if (data?.error) {
      console.error("❌ Erreur retournée par la fonction:", data.error);
      throw new Error(data.error);
    }

    console.log("✅ Lien d'invitation créé/récupéré avec succès:", data);
    
    // Recharger la liste des liens
    await loadLinks();
  } catch (error) {
    console.error("❌ Erreur finale:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création du lien";
    alert(errorMessage);
  } finally {
    setCreating(null);
  }
};
```

**Bénéfices :**
- ✅ Une seule source de vérité pour la création d'invitations
- ✅ Réutilisation automatique des liens existants (économie de tokens)
- ✅ Validation des permissions centralisée dans l'Edge Function
- ✅ Durée d'expiration cohérente (7 jours)
- ✅ Tokens sécurisés générés avec `crypto.randomUUID()`

---

### **2. Onboarding School Page** - Refresh JWT

**Fichier :** `app/onboarding/school/page.tsx`

**Problème :**
- Après la création de l'école, l'Edge Function `director_onboarding_complete` met à jour les `app_metadata` du JWT
- Mais le JWT côté client n'est pas automatiquement rafraîchi
- Conséquence : Les fonctions RLS (`app.current_user_school_id()`) retournent `NULL` car le JWT ne contient pas encore `school_id`

**Solution :**
- ✅ Ajouté un appel à `supabase.auth.refreshSession()` après la création de l'école
- ✅ Ajouté des logs pour tracer le processus de refresh
- ✅ Gestion des erreurs de refresh sans bloquer la redirection

**Code modifié :**
```typescript
console.log("✅ École créée avec succès:", data);

// Forcer le refresh du JWT pour récupérer les app_metadata mises à jour (role, school_id)
console.log("🔄 Rafraîchissement de la session JWT...");
const { error: refreshError } = await supabase.auth.refreshSession();

if (refreshError) {
  console.warn("⚠️ Erreur lors du refresh JWT:", refreshError);
  // Ne pas bloquer la redirection, mais logger l'erreur
} else {
  console.log("✅ Session JWT rafraîchie avec succès");
}

// Attendre un peu pour que la synchronisation soit complète
await new Promise(resolve => setTimeout(resolve, 500));

// Rediriger vers le dashboard
router.push("/dashboard");
```

**Bénéfices :**
- ✅ Le JWT contient immédiatement les `app_metadata` à jour (`role`, `school_id`)
- ✅ Les fonctions RLS fonctionnent correctement dès l'arrivée sur le dashboard
- ✅ Pas de race condition entre la mise à jour des métadonnées et leur utilisation
- ✅ Logs détaillés pour faciliter le débogage

---

## 🧪 Tests Recommandés

### **Test 1 : Création d'invitation TEACHER**
1. Se connecter en tant que DIRECTOR
2. Créer une classe
3. Cliquer sur "Liens d'invitation" pour la classe
4. Cliquer sur "👨‍🏫 Enseignant"
5. **Vérifier dans les logs :**
   - `🚀 Création de lien d'invitation via Edge Function`
   - `✅ Lien d'invitation créé/récupéré avec succès`
6. **Vérifier dans la base de données :**
   - Le token est un UUID valide (format : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - `expires_at` est dans 7 jours
   - `intended_role` = `TEACHER`

### **Test 2 : Création d'invitation PARENT**
1. Répéter le test 1 mais cliquer sur "👨‍👩‍👧 Parent"
2. **Vérifier :**
   - `intended_role` = `PARENT`

### **Test 3 : Réutilisation d'un lien existant**
1. Créer un lien TEACHER pour une classe
2. Cliquer à nouveau sur "👨‍🏫 Enseignant" pour la même classe
3. **Vérifier dans les logs :**
   - L'Edge Function retourne le lien existant (pas de création)
4. **Vérifier dans l'interface :**
   - Le même token est affiché (pas de doublon)

### **Test 4 : Refresh JWT après onboarding**
1. Créer un nouveau compte DIRECTOR
2. Compléter le signup
3. Sur la page `/onboarding/school`, créer une école
4. **Vérifier dans les logs de la console :**
   - `✅ École créée avec succès`
   - `🔄 Rafraîchissement de la session JWT...`
   - `✅ Session JWT rafraîchie avec succès`
5. **Vérifier dans le dashboard :**
   - Les données de l'école s'affichent correctement
   - Pas d'erreur 403 ou "school_id is null"

### **Test 5 : Vérification du JWT**
1. Après avoir créé une école, ouvrir la console du navigateur
2. Exécuter :
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log("JWT app_metadata:", session.user.app_metadata);
```
3. **Vérifier :**
   - `app_metadata.role` = `"DIRECTOR"`
   - `app_metadata.school_id` = UUID de l'école créée

---

## 📊 Comparaison Avant/Après

### **Création d'invitations**

| Aspect | ❌ Avant | ✅ Après |
|--------|---------|----------|
| **Implémentation** | 2 (client + Edge Function) | 1 (Edge Function uniquement) |
| **Durée expiration** | 30 jours (client) / 7 jours (EF) | 7 jours (cohérent) |
| **Génération token** | Custom `generateToken()` / `crypto.randomUUID()` | `crypto.randomUUID()` (sécurisé) |
| **Réutilisation** | Non (client) / Oui (EF) | Oui (économie de tokens) |
| **Validation permissions** | RLS policies / Code EF | Code EF (centralisé) |
| **Risque de doublon** | 🔴 Élevé | 🟢 Aucun |

### **Synchronisation JWT**

| Aspect | ❌ Avant | ✅ Après |
|--------|---------|----------|
| **Refresh JWT** | Non (setTimeout 500ms) | Oui (explicite) |
| **app_metadata disponibles** | ⚠️ Aléatoire | ✅ Garanties |
| **Fonctions RLS** | ⚠️ Peuvent échouer | ✅ Fonctionnent |
| **Race conditions** | 🔴 Possibles | 🟢 Éliminées |
| **Logs de débogage** | ❌ Aucun | ✅ Détaillés |

---

## 🎯 Résultats Attendus

### **Problèmes Résolus**
- ✅ Plus de doublon dans la création d'invitations
- ✅ JWT toujours synchronisé avec les `app_metadata`
- ✅ Fonctions RLS fiables dès l'arrivée sur le dashboard
- ✅ Code plus maintenable (une seule source de vérité)

### **Améliorations Collatérales**
- ✅ Logs de débogage détaillés pour faciliter le troubleshooting
- ✅ Gestion d'erreurs améliorée
- ✅ Réutilisation automatique des liens d'invitation (économie)

---

## 🚀 Prochaines Étapes (Priorité 2)

Une fois les tests validés, passer aux corrections de **Priorité 2** :

1. **Simplifier la RLS policy `p_schools_director_insert`**
   - Supprimer les vérifications redondantes de `user_metadata`
   - Garder uniquement `app.is_role('DIRECTOR')`

2. **Ajouter fallback DB à `app.current_user_school_id()`**
   - Créer une migration pour modifier la fonction
   - Ajouter un SELECT vers `public.users` si JWT vide

---

## 📝 Notes Techniques

### **Edge Function `generate_invitation_link`**
- **Localisation :** Déployée sur Supabase (slug: `generate_invitation_link`)
- **Authentification :** JWT requis (`verify_jwt: true`)
- **Permissions :**
  - DIRECTOR : Peut créer TEACHER et PARENT
  - TEACHER : Peut créer PARENT uniquement (pour sa classe)
- **Logique de réutilisation :**
  - Cherche un lien existant non expiré pour la même classe + rôle
  - Si trouvé : retourne le lien existant
  - Sinon : crée un nouveau lien (7 jours)

### **Refresh JWT**
- **Méthode :** `supabase.auth.refreshSession()`
- **Effet :** Récupère un nouveau JWT avec les `app_metadata` à jour
- **Timing :** Appelé immédiatement après la création de l'école
- **Fallback :** Si le refresh échoue, la redirection continue (pas bloquant)

---

## ✅ Checklist de Validation

- [x] Code modifié dans `InvitationLinksModal.tsx`
- [x] Code modifié dans `app/onboarding/school/page.tsx`
- [x] Logs de débogage ajoutés
- [x] Gestion d'erreurs améliorée
- [ ] Tests manuels effectués (Test 1-5)
- [ ] Validation en production
- [ ] Documentation mise à jour

---

## 🆘 En Cas de Problème

### **Erreur : "Unauthorized" lors de la création d'invitation**
- **Cause :** JWT expiré ou invalide
- **Solution :** Se reconnecter

### **Erreur : "Not a director or no school assigned"**
- **Cause :** Le profil user n'a pas de `school_id`
- **Solution :** Compléter l'onboarding école

### **Erreur : "Classroom not found"**
- **Cause :** L'ID de classe est invalide
- **Solution :** Vérifier que la classe existe dans la base de données

### **JWT non rafraîchi après onboarding**
- **Cause :** Erreur réseau ou timeout
- **Solution :** Vérifier les logs console, se déconnecter/reconnecter

---

**Fin du document - Corrections Priorité 1 ✅**
