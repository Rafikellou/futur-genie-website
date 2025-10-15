"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

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
          Oups !
        </h1>
        <h2 className="heading-lg" style={{ marginBottom: "2rem" }}>
          Une erreur est survenue
        </h2>
        <p className="body-lg text-muted" style={{ marginBottom: "3rem", maxWidth: "500px", margin: "0 auto 3rem" }}>
          {error.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
        </p>
        <button onClick={reset} className="btn btn-primary">
          Réessayer
        </button>
      </div>
    </div>
  );
}
