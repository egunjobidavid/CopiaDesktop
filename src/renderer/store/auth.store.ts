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
  plan: string;
  permissions: string[];
  locationId: string | null;
  locationName: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
  setInitialized: () => void;
  setUser: (user: User) => void;
  setPlan: (plan: string) => void;
  setPermissions: (perms: string[]) => void;
  setLocation: (id: string | null, name: string | null) => void;
  setSessionId: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      tenantId: null,
      plan: 'free',
      permissions: [],
      locationId: null,
      locationName: null,
      sessionId: null,
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
        // Defer post-login API calls until after the route transition completes.
        // Setting isAuthenticated triggers navigation to /dashboard which mounts
        // the entire Layout tree. Running additional set() calls during that mount
        // causes React reconciliation to encounter an undefined element type (#300).
        // Use double-rAF to ensure we are well past any React render cycle.
        requestAnimationFrame(() => requestAnimationFrame(async () => {
          // Load permissions from /auth/me (skip 401 interceptor to avoid undoing login)
          try {
            const { data } = await api.get('/auth/me', { _skipAuth: true } as any);
            if (data?.tenants) {
              const current = data.tenants.find((t: any) => t.id === tenantId);
              if (current?.permissions) {
                set({ permissions: current.permissions });
              }
              if (current?.plan) {
                set({ plan: current.plan });
              }
            }
          } catch (error) { console.error('[AuthStore]', error); }
          // Auto-select default location (skip 401 interceptor)
          try {
            const { data } = await api.get('/locations', { _skipAuth: true } as any);
            const locs = Array.isArray(data) ? data : [];
            const savedLocId = get().locationId;
            const savedLoc = locs.find((l: any) => l.id === savedLocId);
            if (savedLoc) {
              set({ locationName: savedLoc.name });
            } else if (locs.length > 0) {
              const def = locs.find((l: any) => l.isDefault) || locs[0];
              set({ locationId: def.id, locationName: def.name });
            }
          } catch (error) { console.error('[AuthStore]', error); }
        }));
      },

      setPermissions: (perms: string[]) => { set({ permissions: perms }); },

      setPlan: (plan: string) => { set({ plan }); },

      setLocation: (id: string | null, name: string | null) => { set({ locationId: id, locationName: name }); },

      setSessionId: (id: string) => { set({ sessionId: id }); },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          tenantId: null,
          plan: 'free',
          permissions: [],
          locationId: null,
          locationName: null,
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
        plan: state.plan,
        permissions: state.permissions,
        locationId: state.locationId,
        locationName: state.locationName,
        sessionId: state.sessionId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
