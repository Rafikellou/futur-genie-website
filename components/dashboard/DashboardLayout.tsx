"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import type { User, School } from "@/lib/types/database";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    // Récupérer les données de l'école
    const loadSchool = async () => {
      if (!user.school_id) return;

      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("id", user.school_id)
        .single();

      if (error) {
        console.error("Erreur chargement école:", error);
        return;
      }

      setSchool(data);
    };

    loadSchool();
  }, [user.school_id]);

  const navItems = [
    { href: "/dashboard", label: "Accueil", icon: "🏠" },
    { href: "/dashboard/classes", label: "Classes", icon: "🎓" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--primary-blue)" }}>
      {/* Header */}
      <header style={{ 
        background: "var(--secondary-blue)", 
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "1.5rem 0"
      }}>
        <div className="wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link 
            href="/dashboard" 
            style={{ 
              textDecoration: "none", 
              display: "flex", 
              alignItems: "center", 
              gap: "0.75rem" 
            }}
          >
            <Image 
              src="/logos/logo-principal.png"
              alt="Futur Génie"
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
            />
            <span className="heading-sm" style={{ color: "white", margin: 0 }}>
              Futur Génie
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {school && (
              <div style={{ textAlign: "right" }}>
                <div className="body-sm" style={{ color: "rgba(255,255,255,0.6)", marginBottom: "0.25rem" }}>
                  École
                </div>
                <div className="body-md" style={{ color: "white", fontWeight: 600 }}>
                  {school.name}
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="btn btn-secondary"
              style={{ padding: "0.75rem 1.5rem" }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="wrapper" style={{ display: "flex", gap: "2rem", paddingTop: "2rem", paddingBottom: "2rem" }}>
        {/* Sidebar */}
        <aside style={{ width: "250px", flexShrink: 0 }}>
          <div className="card card-glass" style={{ padding: "1.5rem" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="body-md"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.875rem 1rem",
                      borderRadius: "var(--radius-md)",
                      textDecoration: "none",
                      color: isActive ? "white" : "rgba(255,255,255,0.7)",
                      background: isActive ? "rgba(108, 99, 255, 0.2)" : "transparent",
                      fontWeight: isActive ? 600 : 400,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Lien vers le site vitrine */}
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <Link
                  href="/"
                  className="body-sm"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    color: "rgba(255,255,255,0.5)",
                    background: "transparent",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>←</span>
                  Site vitrine
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
