import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: any | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setTokens: (accessToken, refreshToken) => {
        console.log('[AuthStore] Salvando tokens:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken 
        });
        set({ accessToken, refreshToken });
      },
      setUser: (user) => {
        console.log('[AuthStore] Salvando usuário:', user?.email);
        set({ user });
      },
      clearAuth: () => {
        console.log('[AuthStore] Limpando autenticação');
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persiste apenas os tokens e user, não funções
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
