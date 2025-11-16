// ========================================
// Arquivo: front-next/src/auth.config.ts
// Status: ✏️ CORRIGIDO
// Problema Encontrado: PrismaAdapter incompatível com JWT strategy
// Solução Aplicada: Remover adapter, simplificar callbacks
// ========================================

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Configurações de tempo de expiração (em segundos)
const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE) || 30 * 24 * 60 * 60; // Default: 30 days
const JWT_MAX_AGE = Number(process.env.JWT_MAX_AGE) || 30 * 24 * 60 * 60; // Default: 30 days

export const authConfig = {
  // REMOVIDO: PrismaAdapter não é necessário para JWT strategy com Credentials
  // adapter: PrismaAdapter(prisma) as any,

  session: {
    strategy: 'jwt', // Usar JWT, não database sessions
    maxAge: SESSION_MAX_AGE,
    updateAge: 24 * 60 * 60, // Atualizar sessão a cada 24 horas
  },

  jwt: {
    maxAge: JWT_MAX_AGE,
  },

  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/login',
  },

  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        console.log('[NextAuth] Authorize attempt for:', credentials?.email);

        // Validação de entrada
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing credentials');
          throw new Error('Email e senha são obrigatórios');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          // ✅ CHAMAR BACKEND NESTJS PARA OBTER TOKEN JWT
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
          console.log('[NextAuth] Calling backend API:', `${API_URL}/auth/login`);

          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          console.log('[NextAuth] Backend response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log('[NextAuth] Backend error:', errorData);

            if (response.status === 401) {
              throw new Error('Credenciais inválidas');
            }
            throw new Error(errorData.message || 'Erro de autenticação');
          }

          const data = await response.json();
          console.log('[NextAuth] Backend response data:', {
            hasAccessToken: !!data.accessToken,
            hasUser: !!data.user,
            user: data.user?.email,
          });

          if (!data.accessToken || !data.user) {
            throw new Error('Resposta inválida do servidor');
          }

          // ✅ RETORNAR USER COM ACCESS TOKEN
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.fullName,
            role: data.user.role,
            organizationId: data.user.organizationId || null,
            accessToken: data.accessToken, // ← TOKEN JWT DO BACKEND
          };
        } catch (error) {
          console.error('[NextAuth] Authorization error:', error);

          // Re-throw com mensagem genérica para segurança
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Erro interno de autenticação');
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log('[NextAuth] JWT callback - trigger:', trigger, 'hasUser:', !!user);

      // Primeira autenticação - user object disponível
      if (user) {
        token.id = user.id as string;
        token.role = user.role as string;
        token.organizationId = user.organizationId as string | null;
        token.accessToken = user.accessToken as string; // ← SALVAR TOKEN JWT
        console.log('[NextAuth] Token populated:', {
          id: token.id,
          role: token.role,
          hasAccessToken: !!token.accessToken,
          accessTokenLength: (token.accessToken as string)?.length,
        });
      }

      console.log('[NextAuth] JWT callback returning token with accessToken:', !!token.accessToken);
      return token;
    },

    async session({ session, token }) {
      console.log('[NextAuth] Session callback - hasToken:', !!token, 'hasAccessToken:', !!token?.accessToken);

      // Adicionar dados do token à sessão
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string | null;
        session.accessToken = token.accessToken as string; // ← EXPOR TOKEN NA SESSÃO
        console.log('[NextAuth] Session populated:', {
          userId: session.user.id,
          hasAccessToken: !!session.accessToken,
          accessTokenLength: session.accessToken?.length,
        });
      } else {
        console.error('[NextAuth] Session callback missing data:', {
          hasToken: !!token,
          hasSessionUser: !!session.user,
          tokenKeys: token ? Object.keys(token) : [],
        });
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log('[NextAuth] Redirect callback - url:', url, 'baseUrl:', baseUrl);

      // Redirecionar para URL relativa ou baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Redirecionar se for mesmo domínio
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
  },

  // Eventos para logging
  events: {
    async signIn({ user }) {
      console.log('[NextAuth] Sign in event - user:', user.email);
    },
    async signOut() {
      console.log('[NextAuth] Sign out event');
    },
    async session({ session }) {
      console.log('[NextAuth] Session event - user:', session.user?.email);
    },
  },

  // Debug em desenvolvimento
  debug: process.env.NODE_ENV === 'development',

  // Trust host em produção
  trustHost: true,
} satisfies NextAuthConfig;

// ========================================
// Pontos Críticos da Correção:
// - REMOVIDO PrismaAdapter (incompatível com JWT + Credentials)
// - Adicionado logs extensivos para debug
// - Validação mais robusta de credenciais
// - Callback redirect para evitar loops
// - Eventos para rastreamento
// ========================================
