"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Stats {
  classrooms: number;
  teachers: number;
  parents: number;
  quizzes: number;
}

interface DashboardStatsProps {
  schoolId: string;
}

export function DashboardStats({ schoolId }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats>({
    classrooms: 0,
    teachers: 0,
    parents: 0,
    quizzes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const loadStats = async () => {
    try {
      // Nombre de classes
      const { count: classroomsCount } = await supabase
        .from("classrooms")
        .select("*", { count: "exact", head: true })
        .eq("school_id", schoolId);

      // Nombre d'enseignants
      const { count: teachersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .eq("role", "TEACHER");

      // Nombre de parents
      const { count: parentsCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("school_id", schoolId)
        .eq("role", "PARENT");

      // Nombre de quiz
      const { count: quizzesCount } = await supabase
        .from("quizzes")
        .select("*", { count: "exact", head: true })
        .eq("school_id", schoolId);

      setStats({
        classrooms: classroomsCount || 0,
        teachers: teachersCount || 0,
        parents: parentsCount || 0,
        quizzes: quizzesCount || 0,
      });
    } catch (error) {
      console.error("Erreur de chargement des stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Classes", value: stats.classrooms, icon: "🎓", color: "var(--accent-purple)" },
    { label: "Enseignants", value: stats.teachers, icon: "👨‍🏫", color: "var(--accent-orange)" },
    { label: "Parents", value: stats.parents, icon: "👨‍👩‍👧", color: "var(--success-green)" },
    { label: "Quiz générés", value: stats.quizzes, icon: "📝", color: "#3B82F6" },
  ];

  if (loading) {
    return (
      <div className="grid-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card card-glass" style={{ padding: "2rem", height: "150px" }}>
            <div className="body-md text-muted">Chargement...</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="card card-glass card-hover" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div
              style={{
                fontSize: "2.5rem",
                width: "60px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-md)",
                background: `${stat.color}20`,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <div className="heading-lg" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="body-md text-muted">{stat.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
