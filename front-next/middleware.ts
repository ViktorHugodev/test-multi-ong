// ========================================
// Arquivo: front-next/middleware.ts
// Status: ✏️ CORRIGIDO
// Problema Encontrado: Sem callbackUrl no redirect
// Solução Aplicada: Adicionar callbackUrl e melhorar matcher
// ========================================

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/register', '/'];

// Rotas protegidas que requerem autenticação
const protectedRoutes = ['/dashboard'];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isLoggedIn = !!session;
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  console.log('[Middleware]', {
    pathname,
    isLoggedIn,
    isPublicRoute,
    isProtectedRoute,
    session: session?.user?.email,
  });

  // Se está em rota protegida e não está logado
  if (isProtectedRoute && !isLoggedIn) {
    console.log('[Middleware] Redirecting to login - protected route without auth');

    // Criar URL de login com callbackUrl
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Se está logado e tentando acessar login/register
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    console.log('[Middleware] Redirecting to dashboard - already authenticated');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Matcher atualizado para excluir APIs e assets estáticos
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};

// ========================================
// Pontos Críticos da Correção:
// - Adicionado callbackUrl no redirect para /login
// - Redirect de usuário logado de /login para /dashboard
// - Logs detalhados para debug
// - Matcher melhorado para ignorar assets
// - Proteção contra loops de redirect
// ========================================
