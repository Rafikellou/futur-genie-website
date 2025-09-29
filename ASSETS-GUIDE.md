# 📸 Guide d'Ajout d'Assets - Futur Génie

## 🎯 Priorités d'Assets

### 🔥 **Priorité CRITIQUE** (Impact visuel maximal)
1. **Logo principal** (`public/logos/futur-genie-logo.svg`)
2. **Screenshot création exercice** (`public/screenshots/app-creation-exercise.png`)
3. **Mockup interface desktop** (`public/mockups/desktop-mockup.png`)
4. **Badges App Store/Google Play** (`public/icons/app-stores/`)

### ⚡ **Priorité HAUTE** (Crédibilité)
5. **Photos témoignages** (`public/images/testimonials/`)
   - `marie-dubois.jpg` - Directrice École Saint-Martin
   - `pierre-martin.jpg` - Enseignant CE2 École des Tilleuls
6. **Mockup mobile** (`public/mockups/mobile-mockup.png`)
7. **Logos écoles partenaires** (`public/logos/partner-schools/`)

### 📱 **Priorité MOYENNE** (Polish)
8. **Icônes fonctionnalités SVG** (`public/icons/features/`)
9. **Icônes réseaux sociaux** (`public/icons/social/`)
10. **Favicon** (`public/icons/futur-genie-icon.ico`)

## 📏 Spécifications Techniques

### 🖼️ **Images Principales**

#### Logo Principal
- **Fichier** : `public/logos/futur-genie-logo.svg`
- **Format** : SVG vectoriel + PNG fallback
- **Taille** : Scalable (recommandé 400x100px base)
- **Couleurs** : Dégradé violet (#6C63FF) vers orange (#FF6B35)

#### Mockup Desktop
- **Fichier** : `public/mockups/desktop-mockup.png`
- **Taille** : 800x600px minimum
- **Format** : PNG avec transparence
- **Contenu** : Interface enseignant avec création d'exercice
- **Style** : Perspective légère, ombres douces

#### Screenshot Création Exercice
- **Fichier** : `public/screenshots/app-creation-exercise.png`
- **Taille** : 600x400px
- **Format** : PNG
- **Contenu** : Processus de création en 30 secondes
- **UI** : Interface claire, boutons visibles

#### Mockup Mobile
- **Fichier** : `public/mockups/mobile-mockup.png`
- **Taille** : 375x812px (iPhone X ratio)
- **Format** : PNG avec transparence
- **Contenu** : Application élève avec exercices
- **Frame** : Avec ou sans cadre de téléphone

### 👤 **Photos Témoignages**

#### Marie Dubois (Directrice)
- **Fichier** : `public/images/testimonials/marie-dubois.jpg`
- **Taille** : 150x150px (carré)
- **Format** : JPG optimisé
- **Style** : Photo professionnelle, sourire, fond neutre
- **Qualité** : Haute résolution, bien éclairée

#### Pierre Martin (Enseignant)
- **Fichier** : `public/images/testimonials/pierre-martin.jpg`
- **Taille** : 150x150px (carré)
- **Format** : JPG optimisé
- **Style** : Photo professionnelle, environnement scolaire
- **Qualité** : Haute résolution, bien éclairée

### 🏢 **Logos Partenaires**

#### Format Standard
- **Taille** : Hauteur 60px, largeur variable
- **Format** : PNG avec transparence
- **Style** : Logos officiels des écoles
- **Noms** :
  - `ecole-saint-martin.png`
  - `ecole-des-tilleuls.png`
  - `college-victor-hugo.png`

### 📱 **Badges Stores**

#### App Store
- **Fichier** : `public/icons/app-stores/app-store-badge.png`
- **Taille** : 180x60px
- **Format** : PNG officiel Apple
- **Source** : [Apple Developer](https://developer.apple.com/app-store/marketing/guidelines/)

#### Google Play
- **Fichier** : `public/icons/app-stores/google-play-badge.png`
- **Taille** : 180x60px
- **Format** : PNG officiel Google
- **Source** : [Google Play Console](https://play.google.com/intl/en_us/badges/)

### 🎨 **Icônes Fonctionnalités**

#### Format SVG (Recommandé)
- **Taille** : 64x64px base (scalable)
- **Format** : SVG
- **Style** : Ligne claire, couleurs de la charte
- **Fichiers** :
  - `exercise-icon.svg` - Éclair ou crayon
  - `stories-icon.svg` - Livre ouvert
  - `english-icon.svg` - Drapeau UK ou bulle
  - `music-icon.svg` - Note de musique ou piano
  - `puzzles-icon.svg` - Pièce de puzzle
  - `analytics-icon.svg` - Graphique ou tableau

### 🌐 **Icônes Réseaux Sociaux**

#### Format SVG
- **Taille** : 24x24px
- **Format** : SVG monochrome
- **Couleur** : Blanc (#FFFFFF)
- **Fichiers** :
  - `facebook.svg`
  - `twitter.svg`
  - `instagram.svg`
  - `linkedin.svg`

## 🛠️ **Outils Recommandés**

### 📐 **Création/Édition**
- **Figma** - Mockups et interfaces
- **Adobe Illustrator** - Logos et icônes SVG
- **Photoshop** - Retouche photos
- **Canva** - Création rapide

### 🗜️ **Optimisation**
- **TinyPNG** - Compression PNG/JPG
- **SVGOMG** - Optimisation SVG
- **ImageOptim** (Mac) - Compression batch
- **Squoosh** (Web) - Compression en ligne

### 📱 **Mockups**
- **Mockuuups Studio** - Mockups devices
- **Placeit** - Mockups contextuels
- **Smartmockups** - Mockups professionnels

## 🚀 **Processus d'Intégration**

### 1. **Préparation**
```bash
# Créer les dossiers si nécessaire
mkdir -p public/images/testimonials
mkdir -p public/logos/partner-schools
mkdir -p public/icons/features
```

### 2. **Ajout des Assets**
1. Placer les fichiers dans les bons dossiers
2. Respecter les noms de fichiers exacts
3. Vérifier les formats et tailles

### 3. **Test**
1. Rafraîchir la page web
2. Vérifier que les images s'affichent
3. Tester le responsive sur mobile
4. Valider les performances

### 4. **Fallbacks Automatiques**
- Si une image n'existe pas, le site affiche automatiquement un fallback
- Les placeholders CSS restent visibles
- Aucune erreur 404 dans la console

## ✅ **Checklist de Validation**

### Avant Publication
- [ ] Toutes les images critiques sont présentes
- [ ] Les tailles respectent les spécifications
- [ ] Les formats sont optimisés (< 500KB par image)
- [ ] Les noms de fichiers sont corrects
- [ ] Le site fonctionne sans erreurs 404
- [ ] Le responsive est testé sur mobile
- [ ] Les animations fonctionnent correctement

### Qualité Visuelle
- [ ] Images nettes et bien cadrées
- [ ] Cohérence des styles photographiques
- [ ] Respect de la charte graphique
- [ ] Contraste suffisant pour l'accessibilité
- [ ] Pas de pixellisation sur écrans haute résolution

## 🎨 **Exemples Visuels**

### Style Photographique Recommandé
- **Lumineux** - Bien éclairé, couleurs vives
- **Moderne** - Environnement contemporain
- **Humain** - Expressions naturelles, sourires
- **Professionnel** - Cadrage soigné, arrière-plan neutre

### Style Graphique
- **Minimaliste** - Formes simples et claires
- **Coloré** - Utilisation de la palette Futur Génie
- **Cohérent** - Style uniforme entre tous les éléments
- **Accessible** - Contrastes respectés

---

**💡 Conseil** : Commencez par les assets critiques pour un impact visuel immédiat, puis ajoutez progressivement les autres éléments pour peaufiner l'expérience utilisateur.
