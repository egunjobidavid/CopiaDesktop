import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, refreshAccessToken } from '../api/auth';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
  setInitialized: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      tenantId: null,
      isAuthenticated: false,
      isInitialized: false,

      login: async (email: string, password: string) => {
        console.log('[AuthStore] login called');
        const response = await apiLogin({ email, password });
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: {
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.fullName,
            role: 'admin',
          },
          tenantId: response.tenantId,
          isAuthenticated: true,
          isInitialized: true,
        });
        console.log('[AuthStore] login complete');
      },

      logout: () => {
        console.log('[AuthStore] logout called');
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          tenantId: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      },

      refreshAccessToken: async () => {
        const state = get();
        if (!state.refreshToken) {
          throw new Error('No refresh token available');
        }
        const newAccessToken = await refreshAccessToken(
          state.refreshToken,
        );
        set({ accessToken: newAccessToken });
        return newAccessToken;
      },

      setInitialized: () => {
        console.log('[AuthStore] setInitialized called');
        set({ isInitialized: true });
        console.log('[AuthStore] isInitialized is now true');
        console.log('[AuthStore] state:', JSON.stringify(get()));
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'copiaos-auth',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        tenantId: state.tenantId,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log('[AuthStore] onRehydrateStorage outer called');
        return () => {
          console.log('[AuthStore] onRehydrateStorage inner (post-hydration) called');
          useAuthStore.getState().setInitialized();
        };
      },
    },
  ),
);
