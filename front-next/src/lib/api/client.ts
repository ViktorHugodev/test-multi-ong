import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Adicionar token em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Refresh token automático
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Se erro 401 e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

        // Se não houver refreshToken, apenas limpar estado local e propagar o erro
        if (!refreshToken) {
          clearAuth();
          return Promise.reject(error);
        }

        try {
          // Tentar renovar o token
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          setTokens(data.accessToken, data.refreshToken);

          // Retry requisição original com novo token
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Se refresh falhar, limpar estado local e propagar erro
          clearAuth();
          return Promise.reject(refreshError);
        }
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
