import Image from "next/image";
import Link from "next/link";

export function HeroSectionV2() {
  return (
    <section className="section hero-section">
      <div className="wrapper">
        <div className="grid-2" style={{ alignItems: "center" }}>
          {/* Left: Text Content */}
          <div style={{ maxWidth: "600px" }}>
            <h1 className="heading-xl" style={{ marginBottom: "2rem" }}>
              Construisons le{" "}
              <span className="gradient-text">potentiel</span>
              <br />
              de nos enfants
            </h1>
            
            <p className="body-lg text-muted" style={{ marginBottom: "3rem", maxWidth: "540px" }}>
              La seule plateforme où l&apos;enseignant crée des exercices aidant
              les élèves à assimiler{" "}
              <span style={{ color: "var(--accent-purple)", fontWeight: 600 }}>
                la leçon du jour
              </span>
              . Les devoirs deviennent{" "}
              <span style={{ color: "var(--accent-orange)", fontWeight: 600 }}>
                efficaces et amusants
              </span>
              .
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/signup" className="btn btn-primary">
                Créer un compte école gratuitement
              </Link>
              <Link href="/#features" className="btn btn-secondary">
                Découvrir la plateforme
              </Link>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="hero-visual">
            <div style={{ position: "relative", borderRadius: "var(--radius-xl)", overflow: "visible", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                <Image
                  src="/images/hero-illustration.png"
                  alt="Parent et enfant utilisant Futur Génie ensemble"
                  width={600}
                  height={450}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  priority
                />
              </div>

              {/* Floating Cards - Inside Image */}
              <div
                className="card card-glass animate-float"
                style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  left: "1rem",
                  padding: "0.875rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  maxWidth: "200px",
                  animationDelay: "0.5s"
                }}
              >
                <span style={{ fontSize: "1.75rem" }}>🏠</span>
                <span className="body-sm" style={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.3 }}>
                  Revue à la maison en s&apos;amusant
                </span>
              </div>

              <div
                className="card card-glass animate-float"
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1rem",
                  padding: "0.875rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  maxWidth: "180px",
                  animationDelay: "1s"
                }}
              >
                <span style={{ fontSize: "1.75rem" }}>📈</span>
                <span className="body-sm" style={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.3 }}>
                  Progrès en temps réel
                </span>
              </div>

              <div
                className="card card-glass animate-float"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "1rem",
                  transform: "translateY(-50%)",
                  padding: "0.875rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  maxWidth: "190px",
                  animationDelay: "0.2s"
                }}
              >
                <span style={{ fontSize: "1.75rem" }}>🎓</span>
                <span className="body-sm" style={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.3 }}>
                  Leçon du jour en classe
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
