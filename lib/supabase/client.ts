import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement avec valeurs par défaut pour le build
// Next.js 15 tente de prerendre les pages pendant le build, même les Client Components
// Les vraies valeurs seront disponibles au runtime sur Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Créer le client Supabase
// En production, les vraies variables d'environnement seront injectées par Vercel
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
