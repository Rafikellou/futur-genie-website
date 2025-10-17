# Configuration Multi-Domaines pour Futur Génie

## Architecture

Le site utilise **un seul projet Next.js** avec deux domaines :

- **`futurgenie.fr`** : Site marketing public (landing page)
- **`app.futurgenie.fr`** : Application authentifiée (dashboard, classes, invitations)

## Comment ça fonctionne

### Middleware automatique
Le fichier `middleware.ts` détecte automatiquement le domaine et redirige :

- Si tu accèdes à `/dashboard` sur `futurgenie.fr` → redirection vers `app.futurgenie.fr/dashboard`
- Si tu accèdes à `/` sur `app.futurgenie.fr` → redirection vers `futurgenie.fr/`

### Structure des routes

```
app/
├── page.tsx              → Landing page (futurgenie.fr)
├── login/                → Accessible sur les deux domaines
├── signup/               → Accessible sur les deux domaines
├── dashboard/            → app.futurgenie.fr uniquement
├── classes/              → app.futurgenie.fr uniquement
└── onboarding/           → app.futurgenie.fr uniquement
```

## Configuration DNS

### Chez ton registrar (ex: OVH, Gandi, etc.)

1. **Pour `futurgenie.fr`** :
   ```
   Type: A
   Nom: @
   Valeur: 76.76.21.21 (IP Vercel)
   ```

2. **Pour `app.futurgenie.fr`** :
   ```
   Type: CNAME
   Nom: app
   Valeur: cname.vercel-dns.com
   ```

### Dans Vercel

1. Va dans **Settings → Domains**
2. Ajoute les deux domaines :
   - `futurgenie.fr`
   - `app.futurgenie.fr`
3. Vercel va automatiquement générer les certificats SSL

## Variables d'environnement

Assure-toi que tes variables d'environnement sont configurées :

```env
NEXT_PUBLIC_SITE_URL=https://futurgenie.fr
NEXT_PUBLIC_APP_URL=https://app.futurgenie.fr
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Test en local

Pour tester en local avec les domaines :

1. Édite ton fichier `hosts` :
   - Windows : `C:\Windows\System32\drivers\etc\hosts`
   - Mac/Linux : `/etc/hosts`

2. Ajoute :
   ```
   127.0.0.1 futurgenie.local
   127.0.0.1 app.futurgenie.local
   ```

3. Lance le serveur :
   ```bash
   npm run dev
   ```

4. Accède à :
   - `http://futurgenie.local:3000` → Landing page
   - `http://app.futurgenie.local:3000` → Dashboard (après login)

## Avantages de cette approche

✅ **Un seul projet** : Plus facile à maintenir
✅ **Code partagé** : Composants, utils, types communs
✅ **Déploiement unique** : Un seul build
✅ **SEO optimisé** : Domaine principal pour le marketing
✅ **UX claire** : Séparation visuelle entre marketing et app

## Prochaines étapes

1. ✅ Middleware créé
2. ✅ Configuration Next.js mise à jour
3. ⏳ Configurer les DNS
4. ⏳ Ajouter les domaines dans Vercel
5. ⏳ Mettre à jour les variables d'environnement
6. ⏳ Tester les redirections
