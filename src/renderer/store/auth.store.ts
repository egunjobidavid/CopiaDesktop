import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthState } from '../api/client';

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
        const { login: apiLogin } = await import('../api/auth');
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
        // Sync auth state to api/client so interceptors can use it
        // without importing useAuthStore (which would create a circular dep).
        setAuthState({
          accessToken: response.accessToken,
          tenantId,
          refreshToken: response.refreshToken,
          refreshAccessToken: get().refreshAccessToken,
          logout: get().logout,
        });
        // Post-login API calls (permissions, locations) are handled by
        // AuthGuard.runChecks() to avoid calling set() from outside React's
        // render lifecycle, which causes Error #300 during route transition.
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
        setAuthState({
          accessToken: null,
          refreshToken: null,
          tenantId: null,
        });
      },

      refreshAccessToken: async () => {
        const { refreshAccessToken } = await import('../api/auth');
        const state = get();
        if (!state.refreshToken) {
          throw new Error('No refresh token available');
        }
        const newAccessToken = await refreshAccessToken(
          state.refreshToken,
        );
        set({ accessToken: newAccessToken });
        setAuthState({ accessToken: newAccessToken });
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          setAuthState({
            accessToken: state.accessToken,
            tenantId: state.tenantId,
            refreshToken: state.refreshToken,
            refreshAccessToken: state.refreshAccessToken,
            logout: state.logout,
          });
        }
      },
    },
  ),
);
