import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        // Buscar usuário no banco
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
            isActive: true, // Apenas usuários ativos
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

        if (!user || !user.passwordHash) {
          throw new Error('Credenciais inválidas');
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Credenciais inválidas');
        }

        // Retornar dados do usuário (incluindo organizationId e role)
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Adicionar dados ao token na primeira autenticação
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      // Adicionar dados ao objeto session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
