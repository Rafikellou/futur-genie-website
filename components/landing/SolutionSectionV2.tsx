export function SolutionSectionV2() {
  return (
    <section className="section">
      <div className="wrapper">
        <div className="grid-2" style={{ alignItems: "center" }}>
          {/* Left: Text */}
          <div style={{ maxWidth: "600px" }}>
            <h2 className="heading-lg" style={{ marginBottom: "2.5rem" }}>
              Qu&apos;est-ce que Futur Génie ?
            </h2>

            <div className="space-y-md">
              <SolutionPoint
                number="1"
                text="Les enseignants créent en moins de 30 secondes des exercices ludiques, directement liés aux leçons du jour."
              />
              <SolutionPoint
                number="2"
                text="Les élèves jouent le soir à ces activités, en complément ou à la place des devoirs classiques."
              />
            </div>
          </div>

          {/* Right: Visual */}
          <div className="card card-glass" style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>⚡</div>
            <h3 className="heading-md" style={{ marginBottom: "1rem" }}>
              Création en 30s
            </h3>
            <p className="body-md text-muted">
              Interface ultra-simple pour les enseignants
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionPoint({ number, text }: { number: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
      <div
        style={{
          flexShrink: 0,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent-purple), var(--accent-orange))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          fontWeight: 700,
        }}
      >
        {number}
      </div>
      <p className="body-lg text-muted" style={{ paddingTop: "0.75rem" }}>
        {text}
      </p>
    </div>
  );
}
