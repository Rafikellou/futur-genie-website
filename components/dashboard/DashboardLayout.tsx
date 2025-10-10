"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import type { User } from "@/lib/types/database";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Accueil", icon: "🏠" },
    { href: "/dashboard/classes", label: "Classes", icon: "🎓" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--primary-blue)" }}>
      {/* Header */}
      <header style={{ 
        background: "var(--secondary-blue)", 
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "1.5rem 0"
      }}>
        <div className="wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/dashboard" className="heading-sm" style={{ textDecoration: "none", color: "white" }}>
            Futur Génie
          </Link>
          <button
            onClick={signOut}
            className="btn btn-secondary"
            style={{ padding: "0.75rem 1.5rem" }}
          >
            Déconnexion
          </button>
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
