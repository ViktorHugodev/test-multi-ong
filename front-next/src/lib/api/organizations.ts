import { apiClient, createAuthenticatedClient } from './client';
import { Organization } from '@/types/user.types';

// ========================================
// Factory para criar API de organizações com autenticação
// ========================================
export function createOrganizationsApi(accessToken?: string) {
  const client = accessToken ? createAuthenticatedClient(accessToken) : apiClient;

  return {
    getAll: async () => {
      const response = await client.get<Organization[]>('/organizations');
      return response.data;
    },
  };
}

// ========================================
// API padrão (retrocompatibilidade)
// DEPRECATED: Use createOrganizationsApi(accessToken) para endpoints autenticados
// ========================================
export const organizationsApi = createOrganizationsApi();
