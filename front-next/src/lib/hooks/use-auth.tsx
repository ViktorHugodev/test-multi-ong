'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { authApi, LoginDto, RegisterDto } from '@/lib/api/auth';
import { AuthResponse } from '@/types/user.types';

export function useAuth() {
  const router = useRouter();
  const { user, accessToken, setTokens, setUser, clearAuth, isAuthenticated } =
    useAuthStore();

  const login = async (data: LoginDto) => {
    try {
      const response: AuthResponse = await authApi.login(data);

      // Salvar tokens e usuário no store
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);

      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo, ${response.user.fullName}`,
      });

      // Redirect baseado no role
      const isOngUser =
        response.user.role === 'ong_manager' ||
        response.user.role === 'ong_staff';
      const targetPath = isOngUser ? '/dashboard' : '/';

      router.push(targetPath);
      router.refresh();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error('Erro no login', {
        description:
          axiosError.response?.data?.message || 'Credenciais inválidas',
      });
      throw error;
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      const response: AuthResponse = await authApi.register(data);

      // Salvar tokens e usuário no store
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);

      toast.success('Cadastro realizado com sucesso!', {
        description: `Bem-vindo, ${response.user.fullName}`,
      });

      if (response.user.role === 'ong_manager') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error('Erro no cadastro', {
        description:
          axiosError.response?.data?.message || 'Erro ao criar conta',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Chamar endpoint de logout no backend
      await authApi.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Sempre limpar o state local
      clearAuth();
      router.push('/');
      toast.success('Logout realizado', {
        description: 'Até logo!',
      });
    }
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    isLoading: false, // Zustand carrega instantaneamente do storage
    login,
    register,
    logout,
  };
}
