# Images des Personas - Futur Génie

Généré le: 29/09/2025 10:24:00

## Instructions d'utilisation

1. Utiliser les descriptions ci-dessous avec un générateur d'images IA (DALL-E, Midjourney, Stable Diffusion)
2. Sauvegarder les images générées dans le dossier `public/images/personas/`
3. Nommer les fichiers: `enfant-persona.jpg`, `professeur-persona.jpg`, `parent-persona.jpg`
4. Optimiser les images pour le web (compression, format WebP si possible)
5. Résolution recommandée: 800x600px minimum

## Descriptions générées

### 1. Enfant concentré qui galère avec ses devoirs

**Fichier cible:** `enfant-persona.jpg`

**Description pour génération d'image:**
Photo réaliste premium d'un enfant de 8-10 ans assis à son bureau dans sa chambre, concentré mais légèrement frustré par ses devoirs. L'enfant tient un crayon et se gratte la tête avec l'autre main, regardant ses cahiers ouverts avec une expression de concentration mêlée de difficulté. Éclairage doux et chaleureux (lumière de bureau ou naturelle de fin d'après-midi). Environnement domestique moderne et accueillant avec des couleurs douces. Style photographique professionnel avec profondeur de champ, focus sur l'enfant. L'ambiance doit être bienveillante et montrer l'effort de l'enfant sans être dramatique.

---

### 2. Professeur submergé par les tâches

**Fichier cible:** `professeur-persona.jpg`

**Description pour génération d'image:**
Photo réaliste premium d'un(e) enseignant(e) de 35-45 ans assis(e) à son bureau dans une salle de classe, avec une expression fatiguée mais déterminée. Le bureau est couvert de piles de copies à corriger, cahiers, dossiers éparpillés. Ordinateur portable ouvert avec plusieurs onglets. Tableau blanc en arrière-plan avec des notes. Éclairage de bureau professionnel. Tasse de café à moitié vide. L'enseignant(e) peut porter des lunettes et avoir les cheveux légèrement en désordre. Angle légèrement en plongée pour montrer l'ampleur du travail. Couleurs neutres et professionnelles. L'image doit montrer le professionnalisme tout en illustrant la surcharge de travail.

---

### 3. Parent inquiet avec enfant en arrière-plan

**Fichier cible:** `parent-persona.jpg`

**Description pour génération d'image:**
Photo réaliste premium d'un parent de 35-45 ans au premier plan avec une expression légèrement soucieuse mais bienveillante, regardant vers l'enfant ou vers le spectateur. En arrière-plan flou, un enfant assis à un bureau, concentré sur ses devoirs. Environnement familial moderne et chaleureux (salon ou cuisine ouverte). Éclairage doux et naturel de fin d'après-midi. Le parent peut tenir un téléphone ou avoir les bras croisés. Décoration moderne mais familiale. Profondeur de champ avec parent net et enfant légèrement flou. Couleurs douces et rassurantes. L'image doit transmettre l'inquiétude bienveillante du parent pour la réussite de son enfant.

---

## Intégration dans le site

Une fois les images générées, elles remplaceront les SVG actuels dans la section "L'éducation évolue, mais les outils restent figés" du fichier `index.html`.

### Code HTML à modifier:

```html
<!-- Remplacer les SVG par des images -->
<div class="problem-icon">
    <img src="public/images/personas/enfant-persona.jpg" alt="Enfant concentré faisant ses devoirs" class="persona-image" loading="lazy">
</div>
```

### CSS à ajouter:

```css
.persona-image {
    width: 120px;
    height: 120px;
    border-radius: 16px;
    object-fit: cover;
    box-shadow: 0 8px 32px rgba(14, 26, 58, 0.15);
    transition: transform 0.3s ease;
}

.persona-image:hover {
    transform: scale(1.05);
}
```
