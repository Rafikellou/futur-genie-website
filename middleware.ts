import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Déterminer si on est sur le sous-domaine app
  const isAppSubdomain = hostname.startsWith('app.');
  
  // Chemins qui nécessitent une authentification (sur app.futurgenie.fr)
  const appPaths = ['/dashboard', '/classes', '/invitations', '/settings', '/onboarding'];
  const isAppPath = appPaths.some(path => url.pathname.startsWith(path));

  // Chemins publics (sur futurgenie.fr)
  const publicPaths = ['/', '/about', '/pricing', '/contact', '/features'];
  const isPublicPath = publicPaths.some(path => 
    url.pathname === path || url.pathname.startsWith(path + '/')
  );

  // Auth paths (accessibles sur les deux domaines)
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some(path => url.pathname.startsWith(path));

  // Règles de redirection
  if (isAppSubdomain) {
    // Sur app.futurgenie.fr
    if (isPublicPath && !isAuthPath) {
      // Rediriger les pages publiques vers le domaine principal
      const mainDomain = hostname.replace('app.', '');
      return NextResponse.redirect(new URL(url.pathname, `https://${mainDomain}`));
    }
    // Laisser passer les pages app et auth
    return NextResponse.next();
  } else {
    // Sur futurgenie.fr
    if (isAppPath) {
      // Rediriger les pages app vers le sous-domaine
      const appDomain = `app.${hostname}`;
      return NextResponse.redirect(new URL(url.pathname, `https://${appDomain}`));
    }
    // Laisser passer les pages publiques et auth
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
