const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class PersonasImageGenerator {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY non trouvée dans le fichier .env');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    /**
     * Génère une description d'image réaliste pour un persona spécifique
     * @param {string} personaType - Type de persona (enfant, professeur, parent)
     * @returns {Promise<string>} Description de l'image générée
     */
    async generatePersonaImage(personaType) {
        const personas = {
            enfant: {
                title: "Enfant concentré qui galère avec ses devoirs",
                prompt: `Génère une description détaillée pour créer une image réaliste premium d'un enfant de 8-10 ans concentré mais qui galère un peu avec ses devoirs.

Caractéristiques visuelles:
- Enfant assis à un bureau dans sa chambre ou salon
- Expression concentrée mais légèrement frustrée
- Cahiers et livres ouverts devant lui
- Crayon à la main, peut-être se grattant la tête avec l'autre main
- Éclairage doux et chaleureux (lumière de bureau ou naturelle)
- Environnement domestique moderne et accueillant
- Couleurs douces et apaisantes

Style photographique:
- Photo réaliste de haute qualité
- Profondeur de champ avec focus sur l'enfant
- Éclairage naturel et professionnel
- Composition équilibrée et esthétique
- Ambiance bienveillante malgré la difficulté

L'image doit transmettre l'effort et la concentration de l'enfant tout en montrant qu'il a besoin d'aide, sans être dramatique.`
            },
            professeur: {
                title: "Professeur submergé par les tâches",
                prompt: `Génère une description détaillée pour créer une image réaliste premium d'un(e) enseignant(e) de 30-45 ans qui a l'air submergé par le nombre de tâches qu'il/elle doit accomplir.

Caractéristiques visuelles:
- Enseignant(e) assis(e) à son bureau dans une salle de classe ou bureau
- Piles de copies à corriger, cahiers, dossiers éparpillés
- Expression fatiguée mais déterminée
- Peut-être des lunettes, cheveux légèrement en désordre
- Ordinateur portable ouvert avec plusieurs onglets
- Tableau blanc ou paperboard en arrière-plan avec notes
- Éclairage de bureau (néons ou lampe de bureau)
- Tasse de café à moitié vide

Style photographique:
- Photo réaliste de haute qualité
- Angle légèrement en plongée pour montrer l'ampleur du travail
- Éclairage professionnel mais pas trop dramatique
- Couleurs neutres et professionnelles
- Composition qui montre la charge de travail

L'image doit montrer le professionnalisme de l'enseignant tout en illustrant sa surcharge de travail.`
            },
            parent: {
                title: "Parent inquiet avec enfant en arrière-plan",
                prompt: `Génère une description détaillée pour créer une image réaliste premium d'un parent de 35-45 ans qui a l'air un peu inquiet, avec son enfant en arrière-plan en train de faire ses devoirs au bureau.

Caractéristiques visuelles:
- Parent au premier plan, expression légèrement soucieuse mais bienveillante
- Regard dirigé vers l'enfant ou vers nous (spectateur)
- Enfant flou en arrière-plan, assis à un bureau, concentré sur ses devoirs
- Environnement familial moderne et chaleureux (salon ou cuisine ouverte)
- Éclairage doux et naturel (fin d'après-midi)
- Parent peut tenir un téléphone ou avoir les bras croisés
- Décoration moderne mais familiale

Style photographique:
- Photo réaliste de haute qualité
- Profondeur de champ avec parent net et enfant légèrement flou
- Éclairage naturel et chaleureux
- Composition équilibrée montrant la relation parent-enfant
- Couleurs douces et rassurantes
- Ambiance familiale et moderne

L'image doit transmettre l'inquiétude bienveillante du parent pour la réussite de son enfant.`
            }
        };

        const persona = personas[personaType];
        if (!persona) {
            throw new Error(`Type de persona non reconnu: ${personaType}`);
        }

        try {
            console.log(`🎨 Génération de l'image: ${persona.title}...`);
            
            const result = await this.model.generateContent(persona.prompt);
            const response = await result.response;
            return {
                title: persona.title,
                description: response.text().trim()
            };
        } catch (error) {
            console.error('Erreur lors de la génération:', error);
            throw error;
        }
    }

    /**
     * Génère et sauvegarde toutes les descriptions d'images des personas
     */
    async generateAllPersonas() {
        const outputDir = './public/images/personas';
        
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const personas = ['enfant', 'professeur', 'parent'];
        const results = {};

        for (const personaType of personas) {
            try {
                const result = await this.generatePersonaImage(personaType);
                
                // Sauvegarder la description
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `${personaType}-description-${timestamp}.txt`;
                const filepath = path.join(outputDir, filename);
                
                const content = `Persona: ${result.title}
Généré le: ${new Date().toLocaleString('fr-FR')}

Description pour génération d'image:
${result.description}

Instructions pour l'outil de génération d'images:
- Utiliser cette description avec un générateur d'images IA (DALL-E, Midjourney, Stable Diffusion)
- Style: Photo réaliste, haute qualité, éclairage professionnel
- Format: 16:9 ou 4:3 selon la composition
- Résolution: Minimum 1920x1080px pour usage web
`;

                fs.writeFileSync(filepath, content, 'utf8');
                
                console.log(`✅ ${result.title}`);
                console.log(`📁 Sauvegardé: ${filepath}`);
                console.log(`📝 Description: ${result.description.substring(0, 100)}...`);
                console.log('---');
                
                results[personaType] = {
                    ...result,
                    filepath,
                    filename
                };
                
                // Pause entre les générations pour éviter les limites de taux
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Erreur pour ${personaType}:`, error.message);
            }
        }

        // Créer un fichier récapitulatif
        const summaryPath = path.join(outputDir, 'personas-summary.md');
        const summaryContent = `# Images des Personas - Futur Génie

Généré le: ${new Date().toLocaleString('fr-FR')}

## Instructions d'utilisation

1. Utiliser les descriptions ci-dessous avec un générateur d'images IA
2. Sauvegarder les images générées dans le dossier \`public/images/personas/\`
3. Nommer les fichiers: \`enfant-persona.jpg\`, \`professeur-persona.jpg\`, \`parent-persona.jpg\`
4. Optimiser les images pour le web (compression, format WebP si possible)

## Descriptions générées

${Object.entries(results).map(([type, data]) => `
### ${data.title}

**Fichier cible:** \`${type}-persona.jpg\`

**Description:**
${data.description}

---
`).join('')}

## Intégration dans le site

Une fois les images générées, elles remplaceront les SVG actuels dans la section "L'éducation évolue, mais les outils restent figés" du fichier \`index.html\`.
`;

        fs.writeFileSync(summaryPath, summaryContent, 'utf8');
        console.log(`📋 Récapitulatif créé: ${summaryPath}`);

        return results;
    }
}

// Fonction utilitaire pour utilisation en ligne de commande
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length > 0 && args[0] === '--help') {
        console.log(`
🎨 Générateur d'images de personas pour Futur Génie

Usage:
  node generate-personas-images.js [persona]

Personas disponibles:
  - enfant     : Enfant concentré qui galère avec ses devoirs
  - professeur : Professeur submergé par les tâches
  - parent     : Parent inquiet avec enfant en arrière-plan

Sans argument: génère toutes les descriptions de personas
        `);
        return;
    }
    
    try {
        const generator = new PersonasImageGenerator();
        
        if (args.length === 0) {
            // Générer toutes les personas
            console.log('🚀 Génération de toutes les descriptions de personas...\n');
            await generator.generateAllPersonas();
            console.log('\n✅ Toutes les descriptions ont été générées !');
            console.log('📁 Vérifiez le dossier ./public/images/personas/');
        } else {
            // Générer une persona spécifique
            const personaType = args[0];
            const result = await generator.generatePersonaImage(personaType);
            console.log(`✅ ${result.title}`);
            console.log(`📝 ${result.description}`);
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution:', error.message);
        process.exit(1);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    main();
}

module.exports = PersonasImageGenerator;
