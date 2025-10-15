import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour Vercel
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // S'assurer que les pages sont correctement générées
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build (temporaire)
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Ignorer les erreurs ESLint pendant le build (temporaire)
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
