import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para enviar cookies
});

// Request Interceptor: Adicionar informações da sessão NextAuth
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      try {
        const session = await getSession();
        if (session?.user) {
          // Adicionar informações do usuário nos headers
          // O backend pode usar isso para validação
          config.headers['x-user-id'] = (session.user as any).id || '';
          config.headers['x-user-email'] = session.user.email || '';
          
          console.log(`[ApiClient] Request para ${config.url} com sessão ativa (${session.user.email})`);
        } else {
          console.warn(`[ApiClient] Request para ${config.url} SEM SESSÃO`);
        }
      } catch (error) {
        console.error('[ApiClient] Erro ao obter sessão:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tratar erro 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Se erro 401 e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('[ApiClient] Erro 401 detectado:', {
        url: originalRequest.url,
        message: (error.response?.data as any)?.message,
      });
      
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        // Com NextAuth, redirecionar para login
        console.error('[ApiClient] Sessão expirada, redirecionando para login');
        
        // Redirecionar para página de login
        window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
        
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
