import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 160px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div>
        <h1 className="heading-xl" style={{ marginBottom: "1rem" }}>
          404
        </h1>
        <h2 className="heading-lg" style={{ marginBottom: "2rem" }}>
          Page non trouvée
        </h2>
        <p className="body-lg text-muted" style={{ marginBottom: "3rem", maxWidth: "500px", margin: "0 auto 3rem" }}>
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link href="/" className="btn btn-primary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
