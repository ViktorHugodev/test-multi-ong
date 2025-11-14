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
      console.log('🔄 useAuth: Tentando carregar usuário...');
      const token = localStorage.getItem('auth_token');
      console.log('🔑 Token encontrado:', token ? 'SIM' : 'NÃO');

      if (token) {
        try {
          console.log('📡 Buscando perfil do usuário...');
          const userData = await authApi.getProfile();
          console.log('✅ Perfil carregado:', userData);
          setUser(userData);
        } catch (error) {
          console.error('❌ Erro ao carregar perfil:', error);
          localStorage.removeItem('auth_token');
        }
      } else {
        console.log('⚠️ Nenhum token encontrado');
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (data: LoginDto) => {
    try {
      console.log('🔐 Iniciando login...');
      const response: AuthResponse = await authApi.login(data);
      console.log('✅ Login API Response:', response);

      localStorage.setItem('auth_token', response.token);
      console.log('💾 Token salvo no localStorage');

      setUser(response.user);
      console.log('👤 User state atualizado:', response.user);

      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo, ${response.user.fullName}`,
      });

      // Aguardar um tick para garantir state update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect baseado no role
      const isOngUser = response.user.role === 'ong_manager' || response.user.role === 'ong_staff';
      const targetPath = isOngUser ? '/dashboard' : '/';

      console.log('🚀 Redirecionando para:', targetPath);
      console.log('📊 User role:', response.user.role);
      console.log('🏢 Is ONG user?', isOngUser);

      router.push(targetPath);
      router.refresh();

      console.log('✨ Login completo!');
    } catch (error) {
      console.error('❌ Erro no login:', error);
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
