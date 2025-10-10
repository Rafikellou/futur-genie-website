"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ClassroomsList } from "@/components/dashboard/ClassroomsList";

export default function ClassesPage() {
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="heading-lg" style={{ marginBottom: "0.5rem" }}>
              Gestion des classes
            </h1>
            <p className="body-md text-muted">
              Créez et gérez les classes de votre école
            </p>
          </div>
        </div>

        <ClassroomsList schoolId={user.school_id!} userId={user.id} />
      </div>
    </DashboardLayout>
  );
}
