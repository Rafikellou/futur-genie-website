"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Classroom, GradeLevel } from "@/lib/types/database";

interface EditClassroomModalProps {
  classroom: Classroom;
  onClose: () => void;
  onUpdated: () => void;
}

const GRADES: GradeLevel[] = ["CP", "CE1", "CE2", "CM1", "CM2", "6EME", "5EME", "4EME", "3EME"];

export function EditClassroomModal({ classroom, onClose, onUpdated }: EditClassroomModalProps) {
  const [name, setName] = useState(classroom.name);
  const [grade, setGrade] = useState<GradeLevel>(classroom.grade);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("classrooms")
        .update({ name, grade })
        .eq("id", classroom.id);

      if (updateError) throw updateError;
      onUpdated();
    } catch (err) {
      console.error("Erreur de modification:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la modification";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="card card-glass"
        style={{ padding: "2.5rem", maxWidth: "500px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="heading-md" style={{ marginBottom: "2rem" }}>
          Modifier la classe
        </h2>

        <form onSubmit={handleSubmit} className="space-y-md">
          {/* Nom de la classe */}
          <div>
            <label htmlFor="name" className="body-md" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
              Nom de la classe
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Niveau */}
          <div>
            <label htmlFor="grade" className="body-md" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
              Niveau
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="input-field"
              disabled={loading}
              style={{ cursor: "pointer" }}
            >
              {GRADES.map((g) => (
                <option key={g} value={g} style={{ background: "var(--secondary-blue)", color: "white" }}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div
              style={{
                padding: "1rem",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <p className="body-sm" style={{ color: "#ef4444" }}>
                {error}
              </p>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? "Modification..." : "Modifier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
