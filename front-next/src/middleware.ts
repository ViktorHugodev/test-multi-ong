import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Log para debug (remover em produção)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware]', {
      pathname,
      isLoggedIn,
      hasAuth: !!req.auth,
      user: req.auth?.user?.email,
    });
  }

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/', '/login', '/register', '/api/auth', '/products', '/catalogo'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Rotas administrativas que requerem autenticação
  const adminRoutes = ['/dashboard'];
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Redirecionar para login se não autenticado e tentando acessar rota admin
  if (isAdminRoute && !isLoggedIn) {
    console.log('[Middleware] Redirecionando para login - não autenticado');
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirecionar para dashboard se autenticado e tentando acessar login
  if (pathname === '/login' && isLoggedIn) {
    console.log('[Middleware] Redirecionando para dashboard - já autenticado');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
