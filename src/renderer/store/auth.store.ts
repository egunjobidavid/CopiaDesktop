import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, refreshAccessToken } from '../api/auth';
import api from '../api/client';

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
  permissions: string[];
  isAuthenticated: boolean;
  isInitialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
  setInitialized: () => void;
  setUser: (user: User) => void;
  setPermissions: (perms: string[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      tenantId: null,
      permissions: [],
      isAuthenticated: false,
      isInitialized: true,

      login: async (email: string, password: string) => {
        const response = await apiLogin({ email, password });
        const rawRole = response.user.role || 'Staff';
        const roleMap: Record<string, string> = { admin: 'MD', member: 'Staff' };
        const role = roleMap[rawRole] || rawRole;
        const tenantId = response.tenantId;
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: {
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.fullName,
            role,
          },
          tenantId,
          isAuthenticated: true,
          isInitialized: true,
        });
        // Load permissions from /auth/me
        try {
          const { data } = await api.get('/auth/me');
          if (data?.tenants) {
            const current = data.tenants.find((t: any) => t.id === tenantId);
            if (current?.permissions) {
              set({ permissions: current.permissions });
            }
          }
        } catch (_) {}
      },

      setPermissions: (perms: string[]) => { set({ permissions: perms }); },

      logout: () => {
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

      setInitialized: () => set({ isInitialized: true }),
      setUser: (user) => {
        const roleMap: Record<string, string> = { admin: 'MD', member: 'Staff' };
        set({ user: { ...user, role: roleMap[user.role] || user.role } });
      },
    }),
    {
      name: 'copiaos-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tenantId: state.tenantId,
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
