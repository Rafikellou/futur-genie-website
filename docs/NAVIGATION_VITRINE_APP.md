# Navigation entre Site Vitrine et Application

## Objectif

Créer une séparation claire et une navigation logique entre :
- **Site vitrine** : futurgenie.fr (page d'accueil publique)
- **Application** : futurgenie.fr/dashboard (espace utilisateur connecté)

## Modifications apportées

### 1. ✅ Header du site vitrine (HeaderV2.tsx)

**Pour les visiteurs non connectés :**
- Fonctionnalités
- Tarifs
- FAQ
- Connexion (bouton secondaire)
- Créer un compte (bouton primaire)

**Pour les utilisateurs connectés :**
- Fonctionnalités
- Tarifs
- FAQ
- **Mon compte** (bouton primaire) → Redirige vers `/dashboard`

**Changements :**
- Logo redirige toujours vers `/` (site vitrine)
- Suppression des liens "Tableau de bord" et "Classes" du header vitrine
- Ajout du bouton "Mon compte" pour accéder à l'application
- Navigation cohérente même quand l'utilisateur est connecté

### 2. ✅ Menu du dashboard (DashboardLayout.tsx)

**Navigation principale :**
- 🏠 Accueil
- 🎓 Classes

**Nouveau lien discret :**
- ← Site vitrine (en bas du menu, style discret)
  - Couleur : rgba(255,255,255,0.5)
  - Hover : rgba(255,255,255,0.8)
  - Séparé par une ligne horizontale
  - Taille de police réduite (body-sm)

### 3. ✅ Déconnexion (useAuth.ts)

**Avant :** Redirection vers `/login`
**Après :** Redirection vers `/` (site vitrine)

**Comportement :**
- Lors de la déconnexion, l'utilisateur est redirigé vers la page d'accueil publique
- Si l'utilisateur est sur une page protégée (/dashboard, /onboarding) et se déconnecte, il est automatiquement redirigé vers `/`

## Flux utilisateur

### Scénario 1 : Visiteur non connecté
1. Arrive sur `futurgenie.fr`
2. Voit le site vitrine avec header public
3. Peut cliquer sur "Connexion" ou "Créer un compte"

### Scénario 2 : Utilisateur connecté sur le site vitrine
1. Arrive sur `futurgenie.fr`
2. Voit le site vitrine avec header modifié
3. Voit le bouton "Mon compte" en haut à droite
4. Clique sur "Mon compte" → Redirigé vers `/dashboard`

### Scénario 3 : Utilisateur dans l'application
1. Est sur `/dashboard` ou `/dashboard/classes`
2. Voit le menu latéral avec navigation
3. Peut cliquer sur "← Site vitrine" pour retourner à la page d'accueil
4. Peut se déconnecter → Redirigé automatiquement vers `/`

### Scénario 4 : Déconnexion
1. Utilisateur clique sur "Déconnexion" depuis le dashboard
2. Supabase Auth déconnecte l'utilisateur
3. Redirection automatique vers `/` (site vitrine)
4. Header redevient celui des visiteurs non connectés

## Structure de navigation

```
┌─────────────────────────────────────────────────────────┐
│                    Site Vitrine (/)                     │
│                                                         │
│  Header:                                                │
│  - Logo → /                                             │
│  - Fonctionnalités, Tarifs, FAQ                         │
│  - [Non connecté] Connexion + Créer un compte           │
│  - [Connecté] Mon compte → /dashboard                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                Application (/dashboard)                 │
│                                                         │
│  Menu latéral:                                          │
│  - 🏠 Accueil                                            │
│  - 🎓 Classes                                            │
│  - ─────────────────                                    │
│  - ← Site vitrine (discret)                             │
│                                                         │
│  Header:                                                │
│  - Logo + Nom école                                     │
│  - Déconnexion → / (site vitrine)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Avantages

✅ **Séparation claire** : Site vitrine et application sont bien distincts
✅ **Navigation intuitive** : Bouton "Mon compte" explicite pour accéder à l'app
✅ **Retour facile** : Lien discret dans le dashboard pour revenir au site
✅ **Déconnexion logique** : Retour automatique au site vitrine
✅ **Expérience cohérente** : L'utilisateur sait toujours où il se trouve

## Fichiers modifiés

1. `components/layout/HeaderV2.tsx`
   - Modification du menu pour utilisateurs connectés
   - Logo redirige toujours vers `/`
   - Ajout du bouton "Mon compte"

2. `components/dashboard/DashboardLayout.tsx`
   - Ajout du lien "← Site vitrine" dans le menu
   - Style discret avec effet hover

3. `lib/hooks/useAuth.ts`
   - Redirection vers `/` au lieu de `/login` lors de la déconnexion
   - Gestion de l'événement SIGNED_OUT

## Test de validation

### Test 1 : Navigation visiteur
1. Aller sur `futurgenie.fr`
2. Vérifier que le header affiche "Connexion" et "Créer un compte"
3. Cliquer sur le logo → Doit rester sur `/`

### Test 2 : Navigation utilisateur connecté
1. Se connecter avec un compte directeur
2. Aller sur `futurgenie.fr`
3. Vérifier que le header affiche "Mon compte"
4. Cliquer sur "Mon compte" → Doit rediriger vers `/dashboard`

### Test 3 : Lien retour depuis le dashboard
1. Être connecté et sur `/dashboard`
2. Vérifier la présence du lien "← Site vitrine" en bas du menu
3. Cliquer dessus → Doit rediriger vers `/`
4. Vérifier que le header affiche toujours "Mon compte"

### Test 4 : Déconnexion
1. Être connecté et sur `/dashboard`
2. Cliquer sur "Déconnexion"
3. Vérifier la redirection vers `/`
4. Vérifier que le header affiche "Connexion" et "Créer un compte"

## Notes techniques

- Le hook `useAuth` gère automatiquement la redirection lors de la déconnexion
- Le `ConditionalLayout` affiche le header vitrine uniquement sur les pages non-dashboard
- Les événements Supabase Auth (`SIGNED_OUT`) sont écoutés pour gérer la déconnexion en temps réel
