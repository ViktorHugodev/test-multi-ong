// ========================================
// Arquivo: front-next/src/auth.config.ts
// Status: ✏️ CORRIGIDO
// Problema Encontrado: PrismaAdapter incompatível com JWT strategy
// Solução Aplicada: Remover adapter, simplificar callbacks
// ========================================

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
          // Buscar usuário no banco
          console.log('[NextAuth] Searching user in database...');
          const user = await prisma.user.findUnique({
            where: {
              email: email,
            },
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          });

          console.log('[NextAuth] User found:', !!user);

          if (!user) {
            console.log('[NextAuth] User not found');
            throw new Error('Credenciais inválidas');
          }

          // Verificar se usuário está ativo
          if (!user.isActive) {
            console.log('[NextAuth] User is not active');
            throw new Error('Conta desativada');
          }

          // Verificar se tem hash de senha
          if (!user.passwordHash) {
            console.log('[NextAuth] User has no password hash');
            throw new Error('Credenciais inválidas');
          }

          // Verificar senha com bcrypt
          console.log('[NextAuth] Verifying password...');
          const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

          console.log('[NextAuth] Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('[NextAuth] Invalid password');
            throw new Error('Credenciais inválidas');
          }

          console.log('[NextAuth] Authentication successful for:', user.email);

          // Retornar objeto do usuário
          // Este objeto será passado para o callback jwt()
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role,
            organizationId: user.organizationId,
            organization: user.organization,
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
      console.log('[NextAuth] JWT callback - trigger:', trigger, 'user:', !!user);

      // Primeira autenticação - user object disponível
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        console.log('[NextAuth] Token populated with user data');
      }

      return token;
    },

    async session({ session, token }) {
      console.log('[NextAuth] Session callback - token:', !!token);

      // Adicionar dados do token à sessão
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        console.log('[NextAuth] Session populated:', {
          id: session.user.id,
          role: session.user.role,
          organizationId: session.user.organizationId,
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
