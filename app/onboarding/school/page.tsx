"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types/database";

export default function SchoolOnboardingPage() {
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Vérifier que l'utilisateur est connecté et récupérer ses données depuis public.users
    const checkAuth = async () => {
      try {
        // 1. Vérifier l'authentification
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          router.push("/login");
          return;
        }

        // 2. Récupérer les données complètes depuis public.users
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (userError || !userData) {
          console.error("Erreur récupération user:", userError);
          setError("Impossible de récupérer vos informations. Veuillez vous reconnecter.");
          setInitializing(false);
          return;
        }

        // 3. Vérifier le rôle
        if (userData.role !== "DIRECTOR") {
          router.push("/login");
          return;
        }

        // 4. Si l'utilisateur a déjà une école, rediriger vers le dashboard
        if (userData.school_id) {
          router.push("/dashboard");
          return;
        }

        // 5. Stocker les données du user pour l'utiliser lors de la création de l'école
        console.log("✅ Données utilisateur récupérées:", {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          school_id: userData.school_id
        });
        setCurrentUser(userData);
        setInitializing(false);
      } catch (err) {
        console.error("Erreur checkAuth:", err);
        setError("Une erreur est survenue. Veuillez vous reconnecter.");
        setInitializing(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!currentUser) {
        throw new Error("Données utilisateur non disponibles");
      }

      console.log("🏫 Tentative de création d'école avec user:", {
        userId: currentUser.id,
        userRole: currentUser.role,
        schoolName: schoolName
      });

      // Vérifier que la session est toujours active
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }
      console.log("✅ Session active:", session.user.id);

      // Re-vérifier que l'utilisateur existe dans public.users (établir le contexte RLS)
      const { data: userCheck, error: userCheckError } = await supabase
        .from("users")
        .select("id, role")
        .eq("id", currentUser.id)
        .single();

      if (userCheckError || !userCheck) {
        console.error("❌ Erreur vérification user:", userCheckError);
        throw new Error("Impossible de vérifier votre compte. Veuillez vous reconnecter.");
      }

      if (userCheck.role !== "DIRECTOR") {
        throw new Error("Vous devez être directeur pour créer une école.");
      }

      console.log("✅ Contexte RLS établi pour user:", userCheck);

      // 1. Créer l'école (RLS OK car currentUser existe dans public.users avec role DIRECTOR)
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .insert([{ name: schoolName }])
        .select()
        .single();

      if (schoolError) {
        console.error("Erreur création école:", schoolError);
        throw new Error(schoolError.message || "Impossible de créer l'école");
      }

      // 2. Mettre à jour l'utilisateur avec le school_id
      const { error: updateError } = await supabase
        .from("users")
        .update({ school_id: schoolData.id })
        .eq("id", currentUser.id);

      if (updateError) {
        console.error("Erreur mise à jour user:", updateError);
        throw new Error("École créée mais impossible de la lier à votre compte");
      }

      // 3. Attendre un peu pour que la base de données se synchronise
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Erreur lors de la création de l'école:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div className="card card-glass" style={{ padding: "3rem", maxWidth: "500px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <p className="body-md" style={{ marginBottom: "0.5rem" }}>Chargement de vos informations...</p>
            <p className="body-sm text-muted">Récupération des données utilisateur</p>
          </div>
        </div>
      </div>
    );
  }

  // Si pas de currentUser après initialisation, afficher une erreur
  if (!currentUser) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div className="card card-glass" style={{ padding: "3rem", maxWidth: "500px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
            <h2 className="heading-md" style={{ marginBottom: "1rem" }}>Erreur de chargement</h2>
            <p className="body-md text-muted" style={{ marginBottom: "2rem" }}>
              {error || "Impossible de récupérer vos informations"}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn btn-primary"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem"
    }}>
      <div className="card card-glass" style={{ padding: "3rem", maxWidth: "500px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏫</div>
          <h1 className="heading-lg" style={{ marginBottom: "0.5rem" }}>
            Bienvenue {currentUser?.full_name} !
          </h1>
          <p className="body-md text-muted">
            Dernière étape : configurez votre école
          </p>
          {currentUser && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-md)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              <p className="body-sm" style={{ color: "#10b981", textAlign: "center" }}>
                ✅ Connecté en tant que {currentUser.role}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-md">
          <div>
            <label htmlFor="schoolName" className="body-md" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
              Nom de votre école
            </label>
            <input
              type="text"
              id="schoolName"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="input-field"
              placeholder="École primaire Victor Hugo"
              disabled={loading}
            />
            <p className="body-sm text-muted" style={{ marginTop: "0.5rem" }}>
              Ce nom sera visible par tous les enseignants et parents
            </p>
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", fontSize: "1.125rem", padding: "1rem" }}
          >
            {loading ? "Création en cours..." : "Créer mon école"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(255, 255, 255, 0.05)", borderRadius: "var(--radius-md)" }}>
          <p className="body-sm text-muted" style={{ textAlign: "center" }}>
            💡 Après cette étape, vous pourrez créer des classes et inviter des enseignants
          </p>
        </div>
      </div>
    </div>
  );
}
