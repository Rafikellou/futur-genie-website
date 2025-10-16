"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/lib/types/database";

export function useAuth(options?: { redirectIfNotAuth?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const redirectIfNotAuth = options?.redirectIfNotAuth ?? true;

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await checkUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          // Ne rediriger que si on est sur une page protégée
          if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/onboarding")) {
            router.push("/login");
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname]);

  const checkUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        // Ne rediriger que si l'option est activée (par défaut true)
        if (redirectIfNotAuth) {
          router.push("/login");
        }
        setLoading(false);
        return;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error || !userData) {
        console.error("Erreur de récupération utilisateur:", error);
        if (redirectIfNotAuth) {
          router.push("/login");
        }
        setLoading(false);
        return;
      }

      if (userData.role !== "DIRECTOR") {
        await supabase.auth.signOut();
        router.push("/login");
        setLoading(false);
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error("Erreur de vérification:", error);
      if (redirectIfNotAuth) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return { user, loading, signOut };
}
