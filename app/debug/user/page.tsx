"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@/lib/types/database";

interface School {
  id: string;
  name: string;
  created_at: string;
}

interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

export default function DebugUserPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [publicUser, setPublicUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // 1. Récupérer auth.users
      const { data: { user: authUserData } } = await supabase.auth.getUser();
      setAuthUser(authUserData);

      if (!authUserData) {
        setError("Aucun utilisateur authentifié");
        setLoading(false);
        return;
      }

      // 2. Récupérer public.users
      const { data: publicUserData, error: publicUserError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUserData.id)
        .single();

      if (publicUserError) {
        setError(`Erreur public.users: ${publicUserError.message}`);
        setLoading(false);
        return;
      }

      setPublicUser(publicUserData);

      // 3. Récupérer l'école si school_id existe
      if (publicUserData?.school_id) {
        const { data: schoolData, error: schoolError } = await supabase
          .from("schools")
          .select("*")
          .eq("id", publicUserData.school_id)
          .single();

        if (schoolError) {
          setError(`Erreur schools: ${schoolError.message}`);
        } else {
          setSchool(schoolData);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 className="heading-lg" style={{ marginBottom: "2rem" }}>🔍 Diagnostic Utilisateur</h1>
        <p className="body-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 className="heading-lg" style={{ marginBottom: "2rem" }}>🔍 Diagnostic Utilisateur</h1>

      {error && (
        <div style={{
          padding: "1rem",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "var(--radius-md)",
          marginBottom: "2rem"
        }}>
          <p className="body-md" style={{ color: "#ef4444" }}>❌ {error}</p>
        </div>
      )}

      {/* Auth User */}
      <div className="card card-glass" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 className="heading-md" style={{ marginBottom: "1rem" }}>
          {authUser ? "✅" : "❌"} auth.users (Supabase Auth)
        </h2>
        {authUser ? (
          <div style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>ID:</strong> {authUser.id}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>email :</strong> {authUser.email}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>created_at :</strong> {authUser.created_at}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Metadata:</strong>
              <pre style={{ 
                background: "rgba(0,0,0,0.2)", 
                padding: "0.5rem", 
                borderRadius: "4px",
                marginTop: "0.5rem",
                overflow: "auto"
              }}>
                <strong>app_metadata :</strong> {JSON.stringify(authUser.app_metadata, null, 2)}
                <strong>user_metadata :</strong> {JSON.stringify(authUser.user_metadata, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="body-md text-muted">Aucun utilisateur authentifié</p>
        )}
      </div>

      {/* Public User */}
      <div className="card card-glass" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 className="heading-md" style={{ marginBottom: "1rem" }}>
          {publicUser ? "✅" : "❌"} public.users (Application Database)
        </h2>
        {publicUser ? (
          <div style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>ID:</strong> {publicUser.id}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Email:</strong> {publicUser.email}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Full Name:</strong> {publicUser.full_name}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Role:</strong> <span style={{ 
                padding: "0.25rem 0.5rem",
                background: publicUser.role === 'DIRECTOR' ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)",
                borderRadius: "4px"
              }}>{publicUser.role}</span>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>School ID:</strong> {publicUser.school_id ? (
                <span style={{ color: "#10b981" }}>✅ {publicUser.school_id}</span>
              ) : (
                <span style={{ color: "#ef4444" }}>❌ NULL (PAS D&apos;ÉCOLE ASSIGNÉE)</span>
              )}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Classroom ID:</strong> {publicUser.classroom_id || "NULL"}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Created:</strong> {new Date(publicUser.created_at).toLocaleString()}
            </div>
          </div>
        ) : (
          <p className="body-md text-muted">Aucune donnée dans public.users</p>
        )}
      </div>

      {/* School */}
      <div className="card card-glass" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 className="heading-md" style={{ marginBottom: "1rem" }}>
          {school ? "✅" : "❌"} schools (École Associée)
        </h2>
        {publicUser?.school_id ? (
          school ? (
            <div style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>ID:</strong> {school.id}
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>Name:</strong> {school.name}
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>Created:</strong> {new Date(school.created_at).toLocaleString()}
              </div>
            </div>
          ) : (
            <p className="body-md" style={{ color: "#ef4444" }}>
              ❌ École introuvable (school_id existe mais l&apos;école n&apos;existe pas dans la base)
            </p>
          )
        ) : (
          <p className="body-md text-muted">
            Aucune école assignée (school_id = NULL)
          </p>
        )}
      </div>

      {/* Diagnostic Summary */}
      <div className="card card-glass" style={{ padding: "2rem" }}>
        <h2 className="heading-md" style={{ marginBottom: "1rem" }}>📊 Résumé du Diagnostic</h2>
        <div className="space-y-sm">
          {!publicUser?.school_id && publicUser?.role === 'DIRECTOR' && (
            <div style={{
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md)"
            }}>
              <p className="body-md" style={{ color: "#ef4444", fontWeight: 600 }}>
                ⚠️ PROBLÈME DÉTECTÉ
              </p>
              <p className="body-sm" style={{ color: "#ef4444", marginTop: "0.5rem" }}>
                Vous êtes un Director mais vous n&apos;avez pas de school_id assigné.
                C&apos;est pourquoi vous ne pouvez pas créer de classes.
              </p>
              <p className="body-sm" style={{ color: "#ef4444", marginTop: "0.5rem" }}>
                <strong>Solution :</strong> Vous devez compléter l&apos;onboarding sur <a href="/onboarding/school" style={{ textDecoration: "underline" }}>/onboarding/school</a>
              </p>
            </div>
          )}

          {publicUser?.school_id && !school && (
            <div style={{
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md)"
            }}>
              <p className="body-md" style={{ color: "#ef4444", fontWeight: 600 }}>
                ⚠️ PROBLÈME DÉTECTÉ
              </p>
              <p className="body-sm" style={{ color: "#ef4444", marginTop: "0.5rem" }}>
                Votre school_id pointe vers une école qui n&apos;existe pas dans la base de données.
              </p>
              <p className="body-sm" style={{ color: "#ef4444", marginTop: "0.5rem" }}>
                <strong>Solution :</strong> Contactez l&apos;administrateur ou réinitialisez votre profil.
              </p>
            </div>
          )}

          {publicUser?.school_id && school && (
            <div style={{
              padding: "1rem",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "var(--radius-md)"
            }}>
              <p className="body-md" style={{ color: "#10b981", fontWeight: 600 }}>
                ✅ TOUT EST OK
              </p>
              <p className="body-sm" style={{ color: "#10b981", marginTop: "0.5rem" }}>
                Votre profil est correctement configuré. Vous pouvez créer des classes.
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
          <button
            onClick={loadUserData}
            className="btn btn-primary"
          >
            🔄 Recharger les données
          </button>
          <a href="/dashboard" className="btn" style={{ textDecoration: "none" }}>
            ← Retour au Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
