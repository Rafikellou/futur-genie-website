"use client";

import Link from "next/link";

export function HeaderV2() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(14, 26, 58, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="wrapper">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "80px",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1 className="heading-sm gradient-text">Futur Génie</h1>
          </Link>

          {/* Navigation */}
          <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <Link
              href="/#features"
              className="body-md"
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              Fonctionnalités
            </Link>
            <Link
              href="/#pricing"
              className="body-md"
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              Tarifs
            </Link>
            <Link
              href="/#faq"
              className="body-md"
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              FAQ
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: "0.75rem 1.5rem" }}>
              Connexion
            </Link>
            <Link href="/signup" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
              Créer un compte
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
