"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SignupFormData } from "@/lib/types/database";

export function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Créer l'utilisateur dans auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: "DIRECTOR",
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création du compte");

      // 2. Créer l'entrée dans public.users (sans school_id pour l'instant)
      const { error: userError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          role: "DIRECTOR",
          school_id: null, // Sera rempli lors de l'onboarding
          email: formData.email,
          full_name: formData.fullName,
        },
      ]);

      if (userError) throw userError;

      // 3. Connexion automatique et redirection vers onboarding
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      // Redirection vers la page d'onboarding
      window.location.href = "/onboarding/school";
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de l'inscription";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-glass" style={{ padding: "3rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2 className="heading-md" style={{ marginBottom: "2rem", textAlign: "center" }}>
        Créer un compte directeur
      </h2>

      <form onSubmit={handleSubmit} className="space-y-md">
        {/* Nom complet */}
        <div>
          <label htmlFor="fullName" className="body-md" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
            Nom complet
          </label>
          <input
            type="text"
            id="fullName"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="input-field"
            placeholder="Jean Dupont"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="body-md" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
            Email professionnel
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
            placeholder="directeur@ecole.fr"
            disabled={loading}
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="body-md" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="input-field"
            placeholder="Minimum 8 caractères"
            disabled={loading}
          />
          <p className="body-sm text-muted" style={{ marginTop: "0.5rem" }}>
            Au moins 8 caractères
          </p>
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

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%", fontSize: "1.125rem", padding: "1rem" }}
        >
          {loading ? "Création en cours..." : "Créer mon compte école"}
        </button>

        {/* Note */}
        <p className="body-sm text-muted" style={{ textAlign: "center", marginTop: "1.5rem" }}>
          Les enseignants et parents créeront leur compte via l&apos;application iOS
        </p>
      </form>
    </div>
  );
}
