"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { GradeLevel } from "@/lib/types/database";

interface CreateClassroomModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const GRADES: GradeLevel[] = ["CP", "CE1", "CE2", "CM1", "CM2", "6EME", "5EME", "4EME", "3EME"];

export function CreateClassroomModal({ onClose, onCreated }: CreateClassroomModalProps) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<GradeLevel>("CP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Création de classe via Edge Function");
      console.log("Données:", { name, grade });

      // Vérifier la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Session:", { 
        hasSession: !!session, 
        userId: session?.user?.id,
        error: sessionError 
      });

      if (!session) {
        throw new Error("Pas de session active. Veuillez vous reconnecter.");
      }

      console.log("⏳ Appel de l'Edge Function...");
      const startTime = Date.now();

      // Appeler l'Edge Function director_create_classroom
      const { data, error: functionError } = await supabase.functions.invoke('director_create_classroom', {
        body: {
          name,
          grade,
        },
      });

      const duration = Date.now() - startTime;
      console.log(`⏱️ Durée de l'appel: ${duration}ms`);

      if (functionError) {
        console.error("❌ Erreur Edge Function:", functionError);
        console.error("Détails complets:", JSON.stringify(functionError, null, 2));
        throw new Error(functionError.message || "Erreur lors de la création de la classe");
      }

      if (data?.error) {
        console.error("❌ Erreur retournée par la fonction:", data.error);
        throw new Error(data.error);
      }

      console.log("✅ Classe créée avec succès:", data);
      onCreated();
    } catch (err) {
      console.error("❌ Erreur finale:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création";
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
          Créer une classe
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
              placeholder="Ex: Classe de Mme Dupont"
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
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
