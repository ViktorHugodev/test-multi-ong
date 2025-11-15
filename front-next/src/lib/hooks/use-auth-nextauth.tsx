'use client';

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  organization?: {
    name: string;
    email: string;
    description?: string;
    phone?: string;
  };
}

export function useAuthNextAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';

  const login = async (email: string, password: string) => {
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Credenciais inválidas');
        return false;
      }

      toast.success('Login realizado com sucesso!');

      // Redirect baseado no role
      if (session?.user?.role === 'ong_manager' || session?.user?.role === 'ong_staff') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }

      router.refresh();
      return true;
    } catch (error) {
      toast.error('Erro ao fazer login');
      return false;
    }
  };

  const logout = async () => {
    await nextAuthSignOut({ redirect: false });
    router.push('/');
    toast.success('Logout realizado com sucesso');
  };

  const register = async (data: RegisterData) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Erro ao criar conta');
        return false;
      }

      toast.success('Conta criada! Faça login para continuar.');
      router.push('/login');
      return true;
    } catch (error) {
      toast.error('Erro ao criar conta');
      return false;
    }
  };

  return {
    user: session?.user,
    isLoading,
    isAuthenticated: !!session,
    login,
    logout,
    register,
  };
}
