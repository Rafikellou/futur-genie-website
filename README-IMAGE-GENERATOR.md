# 🎨 Générateur d'Images Futur Génie

Script Node.js pour générer des descriptions d'images illustratives pour le site Futur Génie en utilisant l'API Gemini.

## 🚀 Installation

1. **Installer les dépendances :**
```bash
npm install
```

2. **Configurer la clé API :**
   - Obtenez votre clé API Gemini sur [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Ouvrez le fichier `.env`
   - Remplacez `your_gemini_api_key_here` par votre vraie clé API

## 📖 Utilisation

### Ligne de commande
```bash
# Syntaxe générale
node generate-image.js <section> [contexte] [style]

# Exemples
node generate-image.js hero "Section d'accueil avec CTA" illustration
node generate-image.js probleme "Difficultés des enseignants" mockup
node generate-image.js solution "Plateforme éducative" icone
```

### Utilisation programmatique
```javascript
const ImageGenerator = require('./generate-image.js');

const generator = new ImageGenerator();

// Générer une description
const description = await generator.generateImageDescription(
    'hero', 
    'Section d\'accueil avec CTA', 
    'illustration'
);

// Générer et sauvegarder
const result = await generator.generateAndSave(
    'hero', 
    'Section d\'accueil avec CTA', 
    'illustration'
);
```

## 📋 Sections disponibles

Basées sur la structure du site Futur Génie :

- `hero` - Section d'accueil
- `probleme` - Problème & Opportunité  
- `solution` - Notre solution
- `avantages` - Avantages par cible
- `preuve-sociale` - Témoignages et preuves
- `fonctionnalites` - Fonctionnalités détaillées
- `tarification` - Plans et prix
- `disponibilite` - Disponibilité technique
- `faq` - Questions fréquentes
- `cta-final` - Appel à l'action final

## 🎨 Styles disponibles

- `illustration` - Illustration vectorielle moderne
- `mockup` - Mockup d'interface ou produit
- `icone` - Icône ou pictogramme
- `photo` - Photo réaliste
- `schema` - Schéma ou diagramme

## 📁 Structure des fichiers

```
futur-genie-website/
├── generate-image.js      # Script principal
├── package.json          # Dépendances
├── .env                  # Configuration API
├── image-descriptions/   # Descriptions générées (créé automatiquement)
└── README-IMAGE-GENERATOR.md
```

## 🔧 Fonctionnalités

- ✅ Génération de descriptions d'images contextualisées
- ✅ Respect de la charte graphique Futur Génie
- ✅ Sauvegarde automatique des descriptions
- ✅ Interface en ligne de commande
- ✅ API programmatique
- ✅ Gestion d'erreurs robuste

## 🎯 Exemple de sortie

Pour `node generate-image.js hero "Section d'accueil" illustration` :

```
Section: hero
Contexte: Section d'accueil
Style: illustration
Généré le: 29/09/2025 à 10:17:02

Description:
Illustration moderne montrant un enseignant souriant devant un tableau interactif avec des éléments éducatifs flottants (livres, graphiques, icônes d'apprentissage) dans les tons bleu nuit (#0E1A3A) et violet (#6C63FF). L'arrière-plan présente une classe digitalisée avec des touches d'orange (#FF6B35) pour dynamiser l'ensemble. Style vectoriel épuré et professionnel.
```

## 🛠️ Dépannage

**Erreur "GEMINI_API_KEY non trouvée"**
- Vérifiez que le fichier `.env` existe
- Vérifiez que votre clé API est correctement configurée

**Erreur de réseau**
- Vérifiez votre connexion internet
- Vérifiez que votre clé API est valide

## 📝 Notes

- Les descriptions sont optimisées pour la charte graphique Futur Génie
- Chaque génération est horodatée et sauvegardée
- Le script respecte les couleurs et l'identité visuelle du projet
