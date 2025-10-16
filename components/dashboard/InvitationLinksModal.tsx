"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Classroom, UserRole } from "@/lib/types/database";

interface InvitationLink {
  id: string;
  token: string;
  intended_role: UserRole;
  expires_at: string;
  used_at: string | null;
}

interface InvitationLinksModalProps {
  classroom: Classroom;
  userId: string;
  onClose: () => void;
}

export function InvitationLinksModal({ classroom, userId, onClose }: InvitationLinksModalProps) {
  const [links, setLinks] = useState<InvitationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<UserRole | null>(null);

  useEffect(() => {
    loadLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroom.id]);

  const loadLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("invitation_links")
        .select("*")
        .eq("classroom_id", classroom.id)
        .is("used_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Erreur de chargement des liens:", error);
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (role: UserRole) => {
    setCreating(role);
    try {
      console.log("🚀 Création de lien d'invitation via Edge Function");
      console.log("Données:", { classroom_id: classroom.id, intended_role: role });

      // Appeler l'Edge Function generate_invitation_link
      const { data, error } = await supabase.functions.invoke('generate_invitation_link', {
        body: {
          classroom_id: classroom.id,
          intended_role: role,
        },
      });

      if (error) {
        console.error("❌ Erreur Edge Function:", error);
        throw new Error(error.message || "Erreur lors de la création du lien");
      }

      if (data?.error) {
        console.error("❌ Erreur retournée par la fonction:", data.error);
        throw new Error(data.error);
      }

      console.log("✅ Lien d'invitation créé/récupéré avec succès:", data);
      
      // Recharger la liste des liens
      await loadLinks();
    } catch (error) {
      console.error("❌ Erreur finale:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création du lien";
      alert(errorMessage);
    } finally {
      setCreating(null);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} copié !`);
    } catch (error) {
      console.error("Erreur de copie:", error);
      alert("Erreur lors de la copie");
    }
  };

  const getFullLink = (token: string) => {
    return `${window.location.origin}/invite/${token}`;
  };

  const deleteLink = async (linkId: string) => {
    if (!confirm("Supprimer ce lien d'invitation ?")) return;

    try {
      const { error } = await supabase
        .from("invitation_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;
      setLinks(links.filter((l) => l.id !== linkId));
    } catch (error) {
      console.error("Erreur de suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "TEACHER":
        return "Enseignant";
      case "PARENT":
        return "Parent";
      default:
        return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "TEACHER":
        return "var(--accent-orange)";
      case "PARENT":
        return "var(--success-green)";
      default:
        return "var(--accent-purple)";
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
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="card card-glass"
        style={{ padding: "2.5rem", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="heading-md" style={{ marginBottom: "0.5rem" }}>
          Liens d&apos;invitation
        </h2>
        <p className="body-md text-muted" style={{ marginBottom: "2rem" }}>
          {classroom.name} - {classroom.grade}
        </p>

        {/* Boutons de création */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="body-sm" style={{ marginBottom: "1rem", fontWeight: 600 }}>
            Créer un nouveau lien :
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => createLink("TEACHER")}
              disabled={creating !== null}
              className="btn btn-secondary"
              style={{ flex: 1, minWidth: "150px" }}
            >
              {creating === "TEACHER" ? "..." : "👨‍🏫 Enseignant"}
            </button>
            <button
              onClick={() => createLink("PARENT")}
              disabled={creating !== null}
              className="btn btn-secondary"
              style={{ flex: 1, minWidth: "150px" }}
            >
              {creating === "PARENT" ? "..." : "👨‍👩‍👧 Parent"}
            </button>
          </div>
        </div>

        {/* Liste des liens */}
        <div className="space-y-md">
          <h3 className="body-md" style={{ fontWeight: 600 }}>
            Liens actifs :
          </h3>

          {loading ? (
            <div className="body-md text-muted">Chargement...</div>
          ) : links.length === 0 ? (
            <div className="card card-solid" style={{ padding: "2rem", textAlign: "center" }}>
              <p className="body-md text-muted">Aucun lien actif</p>
            </div>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                className="card card-solid"
                style={{ padding: "1.5rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div
                    className="body-sm"
                    style={{
                      background: `${getRoleColor(link.intended_role)}20`,
                      color: getRoleColor(link.intended_role),
                      padding: "0.5rem 1rem",
                      borderRadius: "var(--radius-md)",
                      fontWeight: 600,
                    }}
                  >
                    {getRoleLabel(link.intended_role)}
                  </div>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="body-sm"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "0.5rem",
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>

                <div className="space-y-sm">
                  {/* Lien complet */}
                  <div>
                    <div className="body-sm text-muted" style={{ marginBottom: "0.5rem" }}>
                      Lien complet :
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        value={getFullLink(link.token)}
                        readOnly
                        className="input-field"
                        style={{ flex: 1, fontSize: "0.875rem", padding: "0.75rem" }}
                      />
                      <button
                        onClick={() => copyToClipboard(getFullLink(link.token), "Lien")}
                        className="btn btn-secondary"
                        style={{ padding: "0.75rem 1.5rem", whiteSpace: "nowrap" }}
                      >
                        📋 Copier
                      </button>
                    </div>
                  </div>

                  {/* Token seul */}
                  <div>
                    <div className="body-sm text-muted" style={{ marginBottom: "0.5rem" }}>
                      Token uniquement :
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        value={link.token}
                        readOnly
                        className="input-field"
                        style={{ flex: 1, fontSize: "0.875rem", padding: "0.75rem" }}
                      />
                      <button
                        onClick={() => copyToClipboard(link.token, "Token")}
                        className="btn btn-secondary"
                        style={{ padding: "0.75rem 1.5rem", whiteSpace: "nowrap" }}
                      >
                        📋 Copier
                      </button>
                    </div>
                  </div>

                  {/* Date d'expiration */}
                  <div className="body-sm text-muted">
                    Expire le {new Date(link.expires_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bouton fermer */}
        <div style={{ marginTop: "2rem" }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ width: "100%" }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
