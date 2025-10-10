const features = [
  { icon: "⚡", title: "Exercices enseignants (<30s)", description: "Création rapide d'exercices directement liés aux leçons du jour" },
  { icon: "📚", title: "Catalogue libre service", description: "Exercices prêts selon le niveau académique de vos élèves" },
  { icon: "📖", title: "Histoires à lire & écouter", description: "Développer l'imaginaire et la compréhension écrite" },
  { icon: "🇬🇧", title: "Apprentissage de l'anglais", description: "Découverte ludique de la langue anglaise" },
  { icon: "🧩", title: "Énigmes & jeux éducatifs", description: "Stimulation logique et cognitive par le jeu" },
  { icon: "🎹", title: "Musique (piano)", description: "Découverte artistique et développement sensoriel" },
  { icon: "📊", title: "Données claires", description: "Progression visualisée simplement pour tous" },
  { icon: "🎯", title: "Suivi personnalisé", description: "Adaptation aux besoins de chaque élève" },
];

export function FeaturesSectionV2() {
  return (
    <section id="features" className="section section-alt">
      <div className="wrapper">
        <h2 className="heading-lg text-center" style={{ marginBottom: "4rem" }}>
          Fonctionnalités principales
        </h2>

        <div className="grid-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card card-solid card-hover"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                {feature.icon}
              </div>
              <h3 className="heading-sm" style={{ marginBottom: "0.75rem", fontSize: "1.125rem" }}>
                {feature.title}
              </h3>
              <p className="body-sm text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
