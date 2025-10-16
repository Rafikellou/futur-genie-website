import type { Metadata } from "next";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

export const metadata: Metadata = {
  title: "Futur Génie - Construisons le potentiel de nos enfants",
  description:
    "La seule plateforme où l'enseignant crée des exercices aidant les élèves à assimiler la leçon du jour. Les devoirs deviennent efficaces et amusants avec Futur Génie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
