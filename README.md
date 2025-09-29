# 🚀 Futur Génie - Site Web

## 📋 Description

Site web one-page pour **Futur Génie**, une plateforme éducative innovante qui permet aux enseignants de créer des exercices ludiques en moins de 30 secondes, directement liés aux leçons du jour.

### 🎯 Objectifs

- **Principal** : Convaincre les directeurs d'école et enseignants de créer un compte école
- **Secondaire** : Rassurer les parents sur la valeur éducative de la plateforme

## 🏗️ Structure du Site

### Sections (dans l'ordre)

1. **Hero Section** - Présentation principale avec CTA
2. **Problème & Opportunité** - Les défis actuels de l'éducation
3. **Solution** - Présentation de Futur Génie
4. **Avantages par cible** - Bénéfices pour chaque acteur
5. **Preuve sociale** - Témoignages et statistiques
6. **Fonctionnalités** - Catalogue des fonctionnalités principales
7. **Tarification** - Offre simple et transparente
8. **Disponibilité technique** - Applications mobiles
9. **FAQ** - Questions fréquentes avec accordéons
10. **CTA Final** - Dernière incitation à l'action
11. **Footer** - Liens légaux et contact

## 🎨 Charte Graphique

### Couleurs
- **Bleu nuit principal** : `#0E1A3A`
- **Bleu nuit secondaire** : `#1A2A4A`
- **Bleu nuit tertiaire** : `#243454`
- **Violet accent** : `#6C63FF`
- **Orange accent** : `#FF6B35`
- **Vert succès** : `#10B981`

### Typographie
- **Titres et boutons** : Poppins (Google Fonts)
- **Texte courant** : Inter (Google Fonts)

### Design System
- **Border radius** : 16px pour les cartes, 50px pour les boutons
- **Ombres** : Douces, max 30% d'opacité
- **Espacements** : Système basé sur 16px (8px, 16px, 24px, 32px, 48px, 64px)

## 🛠️ Technologies Utilisées

- **HTML5** - Structure sémantique
- **CSS3** - Styles avec variables CSS et Grid/Flexbox
- **JavaScript ES6+** - Interactions et animations
- **Google Fonts** - Typographie (Poppins & Inter)

## ✨ Fonctionnalités

### Interactions
- ✅ Accordéons FAQ avec animations fluides
- ✅ Animations au scroll (Intersection Observer)
- ✅ Boutons avec effets hover/active/disabled
- ✅ Confettis sur succès d'inscription
- ✅ Scroll fluide entre sections
- ✅ Messages de succès animés

### Responsive Design
- ✅ Mobile-first approach
- ✅ Breakpoints : 360px, 480px, 768px, 1024px
- ✅ Grilles adaptatives
- ✅ Navigation optimisée tactile
- ✅ Images et mockups responsifs

### Accessibilité
- ✅ Navigation au clavier
- ✅ Focus states visibles
- ✅ Respect des préférences utilisateur (reduced-motion)
- ✅ Contraste élevé disponible
- ✅ Structure sémantique HTML

### Performance
- ✅ Lazy loading des images
- ✅ Throttling des événements scroll
- ✅ Préchargement des polices
- ✅ CSS optimisé avec variables
- ✅ JavaScript modulaire
- ✅ Fallbacks automatiques pour images manquantes
- ✅ Structure d'assets organisée

## 🚀 Installation et Utilisation

### Prérequis
Aucun prérequis spécifique. Le site utilise uniquement des technologies web standards.

### Lancement local
1. Cloner ou télécharger les fichiers
2. Ouvrir `index.html` dans un navigateur moderne
3. Ou utiliser un serveur local :
   ```bash
   # Avec Python
   python -m http.server 8000
   
   # Avec Node.js
   npx serve . -p 8000
   
   # Avec PHP
   php -S localhost:8000
   ```

### Structure des fichiers
```
futur-genie-website/
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── scripts.js          # JavaScript
├── README.md           # Documentation
└── public/             # Assets graphiques
    ├── images/         # Photos et illustrations
    │   └── testimonials/   # Photos témoignages
    ├── screenshots/    # Captures d'écran app
    ├── mockups/        # Maquettes interface
    ├── logos/          # Logos et identité
    │   └── partner-schools/ # Logos écoles
    └── icons/          # Icônes et pictogrammes
        ├── features/       # Icônes fonctionnalités
        ├── app-stores/     # Badges stores
        └── social/         # Icônes réseaux sociaux
```

## 📱 Compatibilité

### Navigateurs supportés
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Appareils testés
- ✅ Desktop (1920x1080, 1366x768)
- ✅ Tablette (768x1024, 1024x768)
- ✅ Mobile (375x667, 414x896, 360x640)

## 🔧 Personnalisation

### Modifier les couleurs
Éditer les variables CSS dans `styles.css` :
```css
:root {
    --primary-blue: #0E1A3A;
    --accent-orange: #FF6B35;
    /* ... autres couleurs */
}
```

### Ajouter du contenu
1. **Images** : Placer les assets dans le dossier `public/` selon la structure
2. **Témoignages** : Ajouter photos dans `public/images/testimonials/`
3. **Statistiques** : Mettre à jour les `.stat-number` et leurs animations
4. **FAQ** : Ajouter des `.faq-item` avec questions/réponses
5. **Logos partenaires** : Ajouter dans `public/logos/partner-schools/`

### Intégrations
- **Analytics** : Ajouter Google Analytics dans `scripts.js`
- **CRM** : Connecter les formulaires à votre système
- **Chat** : Intégrer un widget de support client

## 🎯 Roadmap

### V1 (Actuel)
- ✅ Homepage complète avec design et animations
- ✅ Responsive design optimisé
- ✅ Interactions JavaScript avancées
- ✅ Hero image authentique avec éléments flottants
- ✅ Cropping automatique du logo Gemini

### V2 (Prochaine)
- 🔄 Espace de connexion et gestion des comptes école
- 🔄 Formulaires d'inscription fonctionnels
- 🔄 Intégration backend/API

### V3 (Future)
- 📋 Blog/actualités/vidéos
- 📋 Espace de démonstration interactif
- 📋 Multilingue (anglais)

## 📞 Support

Pour toute question ou suggestion :
- **Email** : support@futur-genie.fr
- **Documentation** : Ce README
- **Issues** : Créer une issue dans le projet

## 📄 Licence

© 2024 Futur Génie. Tous droits réservés.

---

**Développé avec ❤️ pour révolutionner l'éducation**
