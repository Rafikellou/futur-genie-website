'use client';

import { 
  School, 
  UserPlus, 
  Users, 
  BookOpen, 
  TrendingUp,
  ArrowDown,
  type LucideIcon
} from 'lucide-react';

interface Step {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: School,
    title: "Création du compte école",
    description: "La responsable d'école crée un compte école sur la plateforme Futur Génie",
    gradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
  },
  {
    number: 2,
    icon: UserPlus,
    title: "Invitation des enseignantes",
    description: "Elle invite les enseignantes de chaque classe à rejoindre la plateforme",
    gradient: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)"
  },
  {
    number: 3,
    icon: Users,
    title: "Invitation des parents",
    description: "Les enseignantes invitent les parents d'élèves dans leur classe respective",
    gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
  },
  {
    number: 4,
    icon: BookOpen,
    title: "Affectation des élèves",
    description: "Chaque élève est affecté à une classe spécifique et recevra les activités créées par son enseignante",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)"
  },
  {
    number: 5,
    icon: TrendingUp,
    title: "Suivi en temps réel",
    description: "L'enseignante a la vision en temps réel des progrès des enfants et peut adapter ses sessions d'apprentissage",
    gradient: "linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)"
  }
];

export function HowItWorksSectionV2() {
  return (
    <section id="how-it-works" className="section section-alt">
      <div className="wrapper">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(3rem, 8vw, 5rem)" }}>
          <h2 className="heading-lg" style={{ marginBottom: "1rem" }}>
            Comment fonctionne <span className="gradient-text">Futur Génie</span> ?
          </h2>
          <p className="body-lg" style={{ 
            maxWidth: "700px", 
            margin: "0 auto",
            opacity: 0.8
          }}>
            Un processus simple et intuitif pour démarrer en quelques étapes
          </p>
        </div>

        {/* Steps Container */}
        <div style={{ 
          maxWidth: "1000px",
          margin: "0 auto"
        }}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.number} style={{ position: "relative" }}>
                {/* Step Card */}
                <div 
                  className="how-it-works-card"
                  style={{ 
                    background: "var(--tertiary-blue)",
                    borderRadius: "var(--radius-lg)",
                    padding: "clamp(1.5rem, 4vw, 2rem)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "clamp(1rem, 3vw, 2rem)",
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    transition: "all 0.3s ease",
                    marginBottom: isLast ? "0" : "clamp(1.5rem, 4vw, 2rem)"
                  }}
                >
                  {/* Icon Container */}
                  <div style={{ 
                    position: "relative", 
                    flexShrink: 0,
                    zIndex: 2
                  }}>
                    <div 
                      style={{ 
                        width: "clamp(64px, 15vw, 80px)",
                        height: "clamp(64px, 15vw, 80px)",
                        borderRadius: "var(--radius-md)",
                        background: step.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)"
                      }}
                    >
                      <Icon 
                        size={36} 
                        color="white" 
                        strokeWidth={2.5}
                        className="step-icon"
                      />
                    </div>
                    
                    {/* Step Number Badge */}
                    <div 
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: step.gradient,
                        border: "3px solid var(--tertiary-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "0.875rem",
                        color: "white",
                        fontFamily: "var(--font-primary)"
                      }}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ 
                    flex: 1, 
                    position: "relative", 
                    zIndex: 2,
                    minWidth: 0
                  }}>
                    <h3 
                      className="heading-sm" 
                      style={{ 
                        marginBottom: "0.5rem",
                        fontSize: "clamp(1.125rem, 3vw, 1.375rem)"
                      }}
                    >
                      {step.title}
                    </h3>
                    <p 
                      className="body-md" 
                      style={{ 
                        opacity: 0.8,
                        lineHeight: 1.7
                      }}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Subtle gradient overlay */}
                  <div 
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "200px",
                      height: "100%",
                      background: step.gradient,
                      opacity: 0.03,
                      zIndex: 1,
                      pointerEvents: "none"
                    }}
                  />
                </div>

                {/* Arrow Connector */}
                {!isLast && (
                  <div 
                    style={{ 
                      display: "flex", 
                      justifyContent: "center",
                      margin: "0",
                      opacity: 0.4,
                      position: "relative",
                      zIndex: 1
                    }}
                  >
                    <ArrowDown size={28} strokeWidth={2.5} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ 
          textAlign: "center", 
          marginTop: "clamp(3rem, 8vw, 5rem)" 
        }}>
          <a href="/signup" className="btn btn-primary" style={{ fontSize: "1.125rem" }}>
            Créer mon compte école
          </a>
        </div>
      </div>

      <style jsx>{`
        .how-it-works-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .how-it-works-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          :global(.step-icon) {
            width: 28px !important;
            height: 28px !important;
          }
        }
      `}</style>
    </section>
  );
}
