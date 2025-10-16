"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Classroom } from "@/lib/types/database";
import { ClassroomCard } from "./ClassroomCard";
import { CreateClassroomModal } from "./CreateClassroomModal";

interface ClassroomsListProps {
  schoolId: string;
  userId: string;
}

export function ClassroomsList({ schoolId, userId }: ClassroomsListProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const loadClassrooms = async () => {
    try {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw error;
      setClassrooms(data || []);
    } catch (error) {
      console.error("Erreur de chargement des classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassroomCreated = () => {
    loadClassrooms();
    setShowCreateModal(false);
  };

  const handleClassroomDeleted = (classroomId: string) => {
    setClassrooms(classrooms.filter((c) => c.id !== classroomId));
  };

  const handleClassroomUpdated = () => {
    loadClassrooms();
  };

  if (loading) {
    return <div className="body-lg text-muted">Chargement des classes...</div>;
  }

  return (
    <div className="space-y-lg">
      {/* Bouton créer */}
      <div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <span style={{ fontSize: "1.25rem" }}>+</span>
          Créer une classe
        </button>
      </div>

      {/* Liste des classes */}
      {classrooms.length === 0 ? (
        <div className="card card-glass" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎓</div>
          <h3 className="heading-sm" style={{ marginBottom: "0.5rem" }}>
            Aucune classe
          </h3>
          <p className="body-md text-muted">
            Commencez par créer votre première classe
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {classrooms.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              userId={userId}
              onDeleted={handleClassroomDeleted}
              onUpdated={handleClassroomUpdated}
            />
          ))}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <CreateClassroomModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleClassroomCreated}
        />
      )}
    </div>
  );
}
