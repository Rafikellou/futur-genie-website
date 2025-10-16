"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Classroom } from "@/lib/types/database";
import { InvitationLinksModal } from "./InvitationLinksModal";
import { EditClassroomModal } from "./EditClassroomModal";

interface ClassroomCardProps {
  classroom: Classroom;
  onDeleted: (classroomId: string) => void;
  onUpdated: () => void;
}

export function ClassroomCard({ classroom, onDeleted, onUpdated }: ClassroomCardProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la classe "${classroom.name}" ?`)) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("classrooms")
        .delete()
        .eq("id", classroom.id);

      if (error) throw error;
      onDeleted(classroom.id);
    } catch (error) {
      console.error("Erreur de suppression:", error);
      alert("Erreur lors de la suppression de la classe");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="card card-glass" style={{ padding: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 className="heading-sm" style={{ marginBottom: "0.5rem" }}>
            {classroom.name}
          </h3>
          <div className="body-sm" style={{ color: "var(--accent-purple)" }}>
            {classroom.grade}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            📧 Liens d&apos;invitation
          </button>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: "center" }}
            >
              ✏️ Modifier
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn"
              style={{
                flex: 1,
                justifyContent: "center",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
              }}
            >
              {deleting ? "..." : "🗑️ Supprimer"}
            </button>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <InvitationLinksModal
          classroom={classroom}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {showEditModal && (
        <EditClassroomModal
          classroom={classroom}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => {
            onUpdated();
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
}
