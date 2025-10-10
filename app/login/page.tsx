import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Connexion - Futur Génie",
  description: "Connectez-vous à votre compte directeur Futur Génie",
};

export default function LoginPage() {
  return (
    <section className="section" style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center" }}>
      <div className="wrapper">
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h1 className="heading-lg" style={{ marginBottom: "1rem" }}>
              Connexion
            </h1>
            <p className="body-lg text-muted">
              Accédez à votre tableau de bord
            </p>
          </div>

          {/* Formulaire */}
          <LoginForm />

          {/* Liens */}
          <div style={{ textAlign: "center", marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link href="/signup" className="body-md" style={{ color: "var(--accent-purple)", textDecoration: "none" }}>
              Pas encore de compte ? Créer un compte école
            </Link>
            <Link href="/" className="body-md" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
