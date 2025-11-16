import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Adicionar token do backend em todas as requisições
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const session = await getSession();
      
      if (session) {
        // Usar o accessToken do backend que está salvo na sessão NextAuth
        const backendToken = (session as any).backendAccessToken;
        
        if (backendToken) {
          config.headers.Authorization = `Bearer ${backendToken}`;
          
          console.log('[ApiClient] Request com Bearer token:', {
            url: config.url,
            userId: session.user?.id,
            role: session.user?.role,
            tokenPrefix: backendToken.substring(0, 20) + '...',
          });
        } else {
          console.warn('[ApiClient] Sessão existe mas SEM backend token:', config.url);
        }
      } else {
        console.warn('[ApiClient] Request SEM sessão:', config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tratar erros 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Se erro 401, redirecionar para login
    if (error.response?.status === 401) {
      console.error('[ApiClient] Erro 401 - Não autorizado:', {
        url: error.config?.url,
        message: (error.response?.data as any)?.message,
      });
      
      if (typeof window !== 'undefined') {
        // Redirecionar para login
        window.location.href = '/login';
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
