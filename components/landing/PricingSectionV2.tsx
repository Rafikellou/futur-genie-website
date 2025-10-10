import Link from "next/link";

export function PricingSectionV2() {
  return (
    <section id="pricing" className="section">
      <div className="wrapper">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="card card-glass" style={{ padding: "3.5rem 2.5rem" }}>
            <h2 className="heading-lg text-center" style={{ marginBottom: "3rem" }}>
              Une offre simple et transparente
            </h2>

            <div className="space-y-lg">
              {/* Trial Badge */}
              <div className="text-center">
                <div
                  style={{
                    display: "inline-block",
                    background: "var(--success-green)",
                    color: "white",
                    padding: "0.75rem 2rem",
                    borderRadius: "var(--radius-xl)",
                    fontWeight: 600,
                    fontSize: "1.125rem",
                    marginBottom: "1rem",
                  }}
                >
                  Essai gratuit
                </div>
                <p className="body-lg" style={{ color: "rgba(255,255,255,0.9)" }}>
                  3 mois sans engagement
                </p>
              </div>

              {/* Price */}
              <div className="text-center" style={{ padding: "2rem 0" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span className="heading-xl gradient-text">79€</span>
                  <span className="heading-sm text-muted">/an par classe</span>
                </div>
                <p className="body-md text-muted" style={{ marginBottom: "0.5rem" }}>
                  Jusqu'à 30 parents par classe
                </p>
                <p className="body-sm text-muted">
                  Paiement au prorata des mois restants de l'année scolaire
                </p>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Link href="/signup" className="btn btn-primary" style={{ fontSize: "1.125rem", padding: "1.25rem 2.5rem" }}>
                  Créer un compte école gratuitement
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
