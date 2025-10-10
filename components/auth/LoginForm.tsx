"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Vérifier que l'utilisateur est un directeur
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (userError) throw userError;

      if (userData.role !== "DIRECTOR") {
        await supabase.auth.signOut();
        throw new Error("Accès réservé aux directeurs d'école");
      }

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Erreur de connexion:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur de connexion";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-glass" style={{ padding: "3rem" }}>
      <form onSubmit={handleSubmit} className="space-y-md">
        {/* Email */}
        <div>
          <label htmlFor="email" className="body-md" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            disabled={loading}
          />
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
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
