import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";

export const metadata = {
  title: "Créer un compte école - Futur Génie",
  description: "Créez votre compte directeur et inscrivez votre école sur Futur Génie",
};

export default function SignupPage() {
  return (
    <section className="section" style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center" }}>
      <div className="wrapper">
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h1 className="heading-lg" style={{ marginBottom: "1rem" }}>
              Bienvenue sur Futur Génie
            </h1>
            <p className="body-lg text-muted">
              Créez votre compte directeur et commencez l&apos;essai gratuit de 3 mois
            </p>
          </div>

          {/* Formulaire */}
          <SignupForm />

          {/* Lien retour */}
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/" className="body-md" style={{ color: "var(--accent-purple)", textDecoration: "none" }}>
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
