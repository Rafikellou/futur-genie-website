"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, loading } = useAuth();

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

        <DashboardStats schoolId={user.school_id!} />
      </div>
    </DashboardLayout>
  );
}
