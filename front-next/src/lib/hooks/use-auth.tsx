'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '@/types/user.types';
import { authApi, LoginDto, RegisterDto } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await authApi.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Erro ao carregar perfil do usuário:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (data: LoginDto) => {
    try {
      const response: AuthResponse = await authApi.login(data);
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);

      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo, ${response.user.fullName}`,
      });

      // Redirect baseado no role
      if (response.user.role === 'ong_manager' || response.user.role === 'ong_staff') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error('Erro no login', {
        description: axiosError.response?.data?.message || 'Credenciais inválidas',
      });
      throw error;
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      const response: AuthResponse = await authApi.register(data);
      localStorage.setItem('auth_token', response.token);
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
        description: axiosError.response?.data?.message || 'Erro ao criar conta',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/');
    toast.success('Logout realizado', {
      description: 'Até logo!',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
