"use client";

import { usePathname } from "next/navigation";
import { HeaderV2 } from "./HeaderV2";
import { FooterV2 } from "./FooterV2";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Routes qui ne doivent PAS afficher le header/footer public
  const isDashboardRoute = pathname?.startsWith("/dashboard");
  const isOnboardingRoute = pathname?.startsWith("/onboarding");
  
  // Si on est sur une route dashboard ou onboarding, pas de header/footer public
  if (isDashboardRoute || isOnboardingRoute) {
    return <>{children}</>;
  }
  
  // Sinon, afficher le layout public avec header et footer
  return (
    <>
      <HeaderV2 />
      <main style={{ paddingTop: "80px" }}>{children}</main>
      <FooterV2 />
    </>
  );
}
