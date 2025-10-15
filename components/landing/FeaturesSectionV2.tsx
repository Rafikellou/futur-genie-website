import { 
  Zap, 
  BookOpen, 
  BookMarked, 
  Globe, 
  Puzzle, 
  Music, 
  BarChart3, 
  Target,
  type LucideIcon
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  { 
    icon: Zap, 
    title: "Exercices enseignants (<30s)", 
    description: "Création rapide d'exercices directement liés aux leçons du jour",
    gradient: "from-yellow-400 to-orange-500"
  },
  { 
    icon: BookOpen, 
    title: "Catalogue libre service", 
    description: "Exercices prêts selon le niveau académique de vos élèves",
    gradient: "from-blue-400 to-indigo-500"
  },
  { 
    icon: BookMarked, 
    title: "Histoires à lire & écouter", 
    description: "Développer l'imaginaire et la compréhension écrite",
    gradient: "from-purple-400 to-pink-500"
  },
  { 
    icon: Globe, 
    title: "Apprentissage de l'anglais", 
    description: "Découverte ludique de la langue anglaise",
    gradient: "from-green-400 to-emerald-500"
  },
  { 
    icon: Puzzle, 
    title: "Énigmes & jeux éducatifs", 
    description: "Stimulation logique et cognitive par le jeu",
    gradient: "from-red-400 to-rose-500"
  },
  { 
    icon: Music, 
    title: "Musique (piano)", 
    description: "Découverte artistique et développement sensoriel",
    gradient: "from-cyan-400 to-blue-500"
  },
  { 
    icon: BarChart3, 
    title: "Données claires", 
    description: "Progression visualisée simplement pour tous",
    gradient: "from-violet-400 to-purple-500"
  },
  { 
    icon: Target, 
    title: "Suivi personnalisé", 
    description: "Adaptation aux besoins de chaque élève",
    gradient: "from-amber-400 to-orange-500"
  },
];

export function FeaturesSectionV2() {
  return (
    <section id="features" className="section section-alt">
      <div className="wrapper">
        <h2 className="heading-lg text-center" style={{ marginBottom: "4rem" }}>
          Fonctionnalités principales
        </h2>

        <div className="grid-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="card card-solid card-hover"
                style={{ 
                  padding: "2rem", 
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Gradient background circle */}
                <div 
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    opacity: 0.1,
                    zIndex: 0
                  }}
                  className={`bg-gradient-to-br ${feature.gradient}`}
                />
                
                {/* Icon with gradient background */}
                <div 
                  style={{ 
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "80px",
                    height: "80px",
                    borderRadius: "20px",
                    marginBottom: "1.5rem",
                    position: "relative",
                    zIndex: 1
                  }}
                  className={`bg-gradient-to-br ${feature.gradient}`}
                >
                  <Icon size={40} color="white" strokeWidth={2} />
                </div>
                
                <h3 className="heading-sm" style={{ marginBottom: "0.75rem", fontSize: "1.125rem", position: "relative", zIndex: 1 }}>
                  {feature.title}
                </h3>
                <p className="body-sm text-muted" style={{ position: "relative", zIndex: 1 }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
