import Image from "next/image";

const problems = [
  {
    image: "/images/personas/enfant-persona.jpg",
    title: "Élèves",
    description: "Difficulté à rester motivés avec les méthodes d'apprentissage traditionnelles",
  },
  {
    image: "/images/personas/professeur-persona.jpg",
    title: "Professeurs",
    description: "Submergés par la charge de travail pour créer des contenus engageants",
  },
  {
    image: "/images/personas/parent-persona.jpg",
    title: "Parents",
    description: "Inquiets de ne pas pouvoir suivre les progrès et accompagner efficacement",
  },
];

export function ProblemSectionV2() {
  return (
    <section className="section section-alt">
      <div className="wrapper">
        <h2 className="heading-lg text-center" style={{ marginBottom: "4rem" }}>
          L'éducation évolue, mais les outils restent figés
        </h2>

        <div className="grid-3">
          {problems.map((problem, index) => (
            <div key={index} className="card card-solid card-hover" style={{ padding: "0", textAlign: "center", overflow: "hidden" }}>
              {/* Image en haut, pleine largeur */}
              <div style={{ 
                width: "100%", 
                height: "280px", 
                position: "relative",
                overflow: "hidden"
              }}>
                <Image
                  src={problem.image}
                  alt={problem.title}
                  fill
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
                {/* Overlay gradient pour lisibilité */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  background: "linear-gradient(to top, rgba(14, 26, 58, 0.9), transparent)"
                }} />
              </div>
              
              {/* Contenu texte */}
              <div style={{ padding: "2rem" }}>
                <h3 className="heading-sm" style={{ marginBottom: "1rem" }}>
                  {problem.title}
                </h3>
                <p className="body-md text-muted">
                  {problem.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
