const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ImageGenerator {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY non trouvée dans le fichier .env');
        }
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    /**
     * Génère une description d'image pour une section du site Futur Génie
     * @param {string} sectionName - Nom de la section (ex: "hero", "probleme", "solution")
     * @param {string} context - Contexte spécifique de la section
     * @param {string} style - Style souhaité (ex: "illustration", "mockup", "icone")
     * @returns {Promise<string>} Description de l'image générée
     */
    async generateImageDescription(sectionName, context = '', style = 'illustration') {
        const prompt = `
Génère une description détaillée d'image pour la section "${sectionName}" d'un site web éducatif appelé "Futur Génie".

Contexte de la plateforme:
- Plateforme éducative pour écoles primaires et collèges
- Cible: directeurs d'école, enseignants, parents
- Couleurs principales: bleu nuit (#0E1A3A), violet (#6C63FF), orange (#FF6B35)
- Style moderne, professionnel mais accessible

Section: ${sectionName}
Contexte spécifique: ${context}
Style souhaité: ${style}

Génère une description d'image en français qui:
1. Respecte l'identité visuelle (couleurs bleu nuit, violet, orange)
2. Soit adaptée au public éducatif
3. Transmette professionnalisme et innovation
4. Soit réalisable en illustration vectorielle ou photo
5. Évite les éléments trop enfantins ou trop corporate

Format de réponse: Description claire et détaillée en 2-3 phrases maximum.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('Erreur lors de la génération:', error);
            throw error;
        }
    }

    /**
     * Génère et sauvegarde une description d'image dans un fichier
     * @param {string} sectionName - Nom de la section
     * @param {string} context - Contexte spécifique
     * @param {string} style - Style souhaité
     * @param {string} outputDir - Dossier de sortie (défaut: ./image-descriptions)
     */
    async generateAndSave(sectionName, context = '', style = 'illustration', outputDir = './image-descriptions') {
        try {
            console.log(`🎨 Génération d'une description d'image pour la section "${sectionName}"...`);
            
            const description = await this.generateImageDescription(sectionName, context, style);
            
            // Créer le dossier s'il n'existe pas
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            // Nom du fichier avec timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${sectionName}-${timestamp}.txt`;
            const filepath = path.join(outputDir, filename);
            
            // Sauvegarder la description
            const content = `Section: ${sectionName}
Contexte: ${context}
Style: ${style}
Généré le: ${new Date().toLocaleString('fr-FR')}

Description:
${description}
`;
            
            fs.writeFileSync(filepath, content, 'utf8');
            
            console.log(`✅ Description générée et sauvegardée dans: ${filepath}`);
            console.log(`📝 Description: ${description}`);
            
            return {
                description,
                filepath,
                filename
            };
            
        } catch (error) {
            console.error('❌ Erreur:', error.message);
            throw error;
        }
    }
}

// Fonction utilitaire pour utilisation en ligne de commande
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
🎨 Générateur d'images pour Futur Génie

Usage:
  node generate-image.js <section> [contexte] [style]

Exemples:
  node generate-image.js hero "Section d'accueil avec CTA" illustration
  node generate-image.js probleme "Difficultés des enseignants" mockup
  node generate-image.js solution "Plateforme éducative" icone

Sections suggérées:
  - hero, probleme, solution, avantages, preuve-sociale
  - fonctionnalites, tarification, disponibilite, faq, cta-final
        `);
        return;
    }
    
    const [sectionName, context = '', style = 'illustration'] = args;
    
    try {
        const generator = new ImageGenerator();
        await generator.generateAndSave(sectionName, context, style);
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution:', error.message);
        process.exit(1);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    main();
}

module.exports = ImageGenerator;
