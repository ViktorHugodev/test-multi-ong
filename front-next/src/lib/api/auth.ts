import { apiClient } from './client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse extends AuthTokens {
  user: {
    id: string;
    email: string;
    fullName?: string;
    role?: string;
    organizationId?: string | null;
    organization?: unknown;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};
