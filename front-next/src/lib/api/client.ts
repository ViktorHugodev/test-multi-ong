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
export function createAuthenticatedClient(accessToken?: string | null): AxiosInstance {
  // Log para debug
  console.log('[AuthenticatedClient] Creating client:', {
    hasToken: !!accessToken,
    tokenLength: accessToken?.length,
    tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING',
  });

  // Se não tiver token, criar cliente sem autenticação (vai dar 401)
  if (!accessToken) {
    console.warn('[AuthenticatedClient] No access token provided! Requests will fail with 401');
    return apiClient;
  }

  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Request Interceptor: Log de requisição
  client.interceptors.request.use(
    (config) => {
      console.log('[AuthenticatedClient] Making request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuthHeader: !!config.headers?.Authorization,
        authHeaderPreview: config.headers?.Authorization
          ? `${String(config.headers.Authorization).substring(0, 30)}...`
          : 'MISSING',
      });
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Log de erros
  client.interceptors.response.use(
    (response) => {
      console.log('[AuthenticatedClient] Request successful:', {
        status: response.status,
        url: response.config?.url,
      });
      return response;
    },
    (error: AxiosError) => {
      console.error('[AuthenticatedClient] Request error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        hasAuthHeader: !!error.config?.headers?.Authorization,
      });

      // Se 401, o token pode ter expirado ou não estar sendo enviado
      if (error.response?.status === 401) {
        console.error('[AuthenticatedClient] 401 Unauthorized - Possible causes:', [
          '1. Token not being sent in Authorization header',
          '2. Token is expired or invalid',
          '3. Backend JWT_SECRET mismatch',
          '4. CORS blocking Authorization header',
        ]);
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
