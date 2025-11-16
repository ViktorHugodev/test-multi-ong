import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 dias (mesmo tempo do backend)
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
          console.error('[Auth] Credenciais faltando');
          return null;
        }

        try {
          console.log('[Auth] Autenticando no backend:', credentials.email);
          
          // Autenticar diretamente no backend NestJS
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const { user, accessToken, refreshToken } = response.data;

          console.log('[Auth] Login bem-sucedido:', {
            userId: user.id,
            email: user.email,
            role: user.role,
          });

          // Retornar dados do usuário + tokens do backend
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role,
            organizationId: user.organizationId,
            organization: user.organization,
            // Incluir tokens do backend no objeto user
            backendAccessToken: accessToken,
            backendRefreshToken: refreshToken,
          };
        } catch (error: any) {
          console.error('[Auth] Erro ao autenticar:', error.response?.data || error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Na primeira autenticação, adicionar dados do usuário ao token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
        token.organization = (user as any).organization;
        // Salvar tokens do backend no token JWT do NextAuth
        token.backendAccessToken = (user as any).backendAccessToken;
        token.backendRefreshToken = (user as any).backendRefreshToken;
        
        console.log('[Auth] Token JWT criado com dados do backend');
      }

      return token;
    },
    async session({ session, token }) {
      // Adicionar dados do token à sessão
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string | null;
        // Incluir tokens do backend na sessão
        (session as any).backendAccessToken = token.backendAccessToken;
        (session as any).backendRefreshToken = token.backendRefreshToken;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
