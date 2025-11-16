import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

// ========================================
// Cliente API Base (sem autenticação)
// ========================================
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================
// Factory para criar cliente autenticado
// ========================================
export function createAuthenticatedClient(accessToken: string): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Response Interceptor: Log de erros
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      console.error('[AuthenticatedClient] Request error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
      });

      // Se 401, o token pode ter expirado - NextAuth deve lidar com refresh
      if (error.response?.status === 401) {
        console.warn('[AuthenticatedClient] Token expired or invalid');
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// ========================================
// Helper para fazer requisições com token
// ========================================
export async function fetchWithAuth<T>(
  accessToken: string,
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: unknown;
    params?: Record<string, unknown>;
  } = {}
): Promise<T> {
  const client = createAuthenticatedClient(accessToken);
  const { method = 'GET', data, params } = options;

  const response = await client.request<T>({
    url,
    method,
    data,
    params,
  });

  return response.data;
}

// ========================================
// Classe de erro customizada
// ========================================
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

// ========================================
// Helper para extrair erro da resposta
// ========================================
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || axiosError.message || 'Erro na requisição';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erro desconhecido';
}
