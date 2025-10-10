import Link from "next/link";

export function FooterV2() {
  return (
    <footer className="section-alt" style={{ padding: "4rem 0" }}>
      <div className="wrapper">
        <div className="grid-3" style={{ marginBottom: "3rem" }}>
          {/* Logo & Description */}
          <div>
            <h3 className="heading-sm" style={{ marginBottom: "1rem" }}>
              Futur Génie
            </h3>
            <p className="body-md text-muted">
              Construisons ensemble le potentiel de nos enfants
            </p>
          </div>

          {/* Légal */}
          <div>
            <h4 className="heading-sm" style={{ marginBottom: "1rem", fontSize: "1.125rem" }}>
              Légal
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link href="/mentions-legales" className="body-md text-muted" style={{ textDecoration: "none" }}>
                Mentions légales
              </Link>
              <Link href="/confidentialite" className="body-md text-muted" style={{ textDecoration: "none" }}>
                Politique de confidentialité
              </Link>
              <Link href="/conditions" className="body-md text-muted" style={{ textDecoration: "none" }}>
                Conditions d'utilisation
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="heading-sm" style={{ marginBottom: "1rem", fontSize: "1.125rem" }}>
              Support
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a href="mailto:support@futur-genie.fr" className="body-md text-muted" style={{ textDecoration: "none" }}>
                support@futur-genie.fr
              </a>
              <Link href="/#faq" className="body-md text-muted" style={{ textDecoration: "none" }}>
                FAQ
              </Link>
              <Link href="/contact" className="body-md text-muted" style={{ textDecoration: "none" }}>
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <p className="body-sm text-muted">
            &copy; 2024 Futur Génie. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
