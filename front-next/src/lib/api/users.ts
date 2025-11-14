import { apiClient } from './client';
import { User } from '@/types/user.types';

export interface UpdateUserDto {
  role?: 'admin' | 'ong_manager' | 'ong_staff' | 'customer';
  organizationId?: string;
}

export const usersApi = {
  getCurrentUser: async () => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  updateCurrentUser: async (data: UpdateUserDto) => {
    const response = await apiClient.patch<User>('/users/me', data);
    return response.data;
  },

  getAvailableRoles: async () => {
    const response = await apiClient.get<string[]>('/users/roles');
    return response.data;
  },
};
