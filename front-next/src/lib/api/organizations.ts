import { apiClient } from './client';
import { Organization } from '@/types/user.types';

export const organizationsApi = {
  getAll: async () => {
    const response = await apiClient.get<Organization[]>('/organizations');
    return response.data;
  },
};
