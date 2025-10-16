"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers l'onboarding si l'utilisateur n'a pas encore d'école
    if (!loading && user && !user.school_id) {
      router.push("/onboarding/school");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="body-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Si pas de school_id, on redirige (géré par useEffect)
  if (!user.school_id) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="body-lg">Redirection...</div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-lg">
        <div>
          <h1 className="heading-lg" style={{ marginBottom: "0.5rem" }}>
            Tableau de bord
          </h1>
          <p className="body-md text-muted">
            Bienvenue {user.full_name}
          </p>
        </div>

        <DashboardStats schoolId={user.school_id} />
      </div>
    </DashboardLayout>
  );
}
