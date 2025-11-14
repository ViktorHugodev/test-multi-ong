import { apiClient } from './client';
import { AuthResponse } from '@/types/user.types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  role: 'ong_manager' | 'customer';
  organization?: {
    name: string;
    description?: string;
    email: string;
    phone?: string;
  };
}

export const authApi = {
  login: async (data: LoginDto) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};
