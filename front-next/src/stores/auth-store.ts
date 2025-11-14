'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'ong_manager' | 'ong_staff' | 'customer';
  organizationId: string | null;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null }),

      isAuthenticated: () => {
        const state = get();
        return !!state.accessToken && !!state.user;
      },
    }),
    {
      name: 'auth-storage',
      // Apenas refreshToken e user persistem
      // accessToken fica em memória por segurança
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
