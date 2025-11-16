// ========================================
// Hook: useAuthenticatedApi
// Propósito: Fornecer cliente API autenticado usando token da sessão NextAuth
// ========================================

'use client';

import { useSession } from 'next-auth/react';
import { useMemo, useCallback } from 'react';
import { createAuthenticatedClient, fetchWithAuth, getApiErrorMessage } from '@/lib/api/client';
import { AxiosInstance } from 'axios';

interface UseAuthenticatedApiReturn {
  // Cliente Axios configurado com token
  client: AxiosInstance | null;

  // Token de acesso atual
  accessToken: string | null;

  // Helper para fazer requisições
  fetch: <T>(
    url: string,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      data?: unknown;
      params?: Record<string, unknown>;
    }
  ) => Promise<T>;

  // Estado da sessão
  isAuthenticated: boolean;
  isLoading: boolean;

  // Dados do usuário
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string | null;
  } | null;
}

export function useAuthenticatedApi(): UseAuthenticatedApiReturn {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.accessToken;
  const accessToken = session?.accessToken || null;

  // Criar cliente autenticado memoizado
  const client = useMemo(() => {
    if (!accessToken) {
      return null;
    }
    return createAuthenticatedClient(accessToken);
  }, [accessToken]);

  // Helper para fazer fetch autenticado
  const authenticatedFetch = useCallback(
    async <T>(
      url: string,
      options?: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        data?: unknown;
        params?: Record<string, unknown>;
      }
    ): Promise<T> => {
      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }
      return fetchWithAuth<T>(accessToken, url, options);
    },
    [accessToken]
  );

  // Dados do usuário
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        organizationId: session.user.organizationId,
      }
    : null;

  return {
    client,
    accessToken,
    fetch: authenticatedFetch,
    isAuthenticated,
    isLoading,
    user,
  };
}

// ========================================
// Hook simplificado para obter apenas o token
// ========================================
export function useAccessToken(): string | null {
  const { data: session } = useSession();
  return session?.accessToken || null;
}

// ========================================
// Re-export do helper de erro
// ========================================
export { getApiErrorMessage };
