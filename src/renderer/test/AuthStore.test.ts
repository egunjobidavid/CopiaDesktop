import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/client', () => ({
  default: { post: vi.fn(), get: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
  setAuthState: vi.fn(),
}));

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  refreshToken: vi.fn(),
  refreshAccessToken: vi.fn(),
  getProfile: vi.fn(),
  register: vi.fn(),
}));

vi.unmock('../store/auth.store');

import { useAuthStore } from '../store/auth.store';
import { setAuthState } from '../api/client';

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
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
    });
  });

  it('initializes with default state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.plan).toBe('free');
    expect(state.permissions).toEqual([]);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it('setPermissions updates permissions', () => {
    useAuthStore.getState().setPermissions(['dashboard', 'hr', 'sales']);
    const state = useAuthStore.getState();
    expect(state.permissions).toEqual(['dashboard', 'hr', 'sales']);
  });

  it('setPlan updates plan', () => {
    useAuthStore.getState().setPlan('business');
    expect(useAuthStore.getState().plan).toBe('business');
  });

  it('setLocation updates location', () => {
    useAuthStore.getState().setLocation('loc-1', 'Head Office');
    const state = useAuthStore.getState();
    expect(state.locationId).toBe('loc-1');
    expect(state.locationName).toBe('Head Office');
  });

  it('setLocation with null clears location', () => {
    useAuthStore.getState().setLocation('loc-1', 'Head Office');
    useAuthStore.getState().setLocation(null, null);
    const state = useAuthStore.getState();
    expect(state.locationId).toBeNull();
    expect(state.locationName).toBeNull();
  });

  it('setSessionId updates session', () => {
    useAuthStore.getState().setSessionId('session-1');
    expect(useAuthStore.getState().sessionId).toBe('session-1');
  });

  it('setInitialized sets isInitialized', () => {
    useAuthStore.setState({ isInitialized: false });
    useAuthStore.getState().setInitialized();
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });

  it('setUser maps roles correctly', () => {
    useAuthStore.getState().setUser({ id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'admin' });
    expect(useAuthStore.getState().user?.role).toBe('MD');
  });

  it('setUser preserves non-mapped roles', () => {
    useAuthStore.getState().setUser({ id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'Director' });
    expect(useAuthStore.getState().user?.role).toBe('Director');
  });

  it('setUser sets member to Staff', () => {
    useAuthStore.getState().setUser({ id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'member' });
    expect(useAuthStore.getState().user?.role).toBe('Staff');
  });

  it('logout clears all auth state and calls setAuthState', () => {
    useAuthStore.setState({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test', role: 'MD' },
      tenantId: 't1',
      plan: 'business',
      permissions: ['dashboard'],
      locationId: 'loc-1',
      locationName: 'Office',
      isAuthenticated: true,
    });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.tenantId).toBeNull();
    expect(state.plan).toBe('free');
    expect(state.permissions).toEqual([]);
    expect(state.locationId).toBeNull();
    expect(state.locationName).toBeNull();
    expect(setAuthState).toHaveBeenCalled();
  });

  it('login calls api and updates state', async () => {
    const { login: apiLogin } = await import('../api/auth');
    vi.mocked(apiLogin).mockResolvedValue({
      accessToken: 'new-token',
      refreshToken: 'new-refresh',
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'admin' },
      tenantId: 't1',
    });

    await useAuthStore.getState().login('test@test.com', 'password');
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('new-token');
    expect(state.user?.role).toBe('MD');
    expect(state.tenantId).toBe('t1');
    expect(apiLogin).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
  });

  it('login throws and does not set authenticated on failure', async () => {
    const { login: apiLogin } = await import('../api/auth');
    vi.mocked(apiLogin).mockRejectedValue(new Error('Invalid credentials'));

    await expect(useAuthStore.getState().login('test@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('refreshAccessToken throws without refresh token', async () => {
    useAuthStore.setState({ refreshToken: null });
    await expect(useAuthStore.getState().refreshAccessToken()).rejects.toThrow('No refresh token available');
  });

  it('refreshAccessToken calls api and updates token', async () => {
    useAuthStore.setState({ refreshToken: 'old-refresh' });
    const { refreshAccessToken: apiRefresh } = await import('../api/auth');
    vi.mocked(apiRefresh).mockResolvedValue('new-access-token');

    const token = await useAuthStore.getState().refreshAccessToken();
    expect(token).toBe('new-access-token');
    expect(useAuthStore.getState().accessToken).toBe('new-access-token');
    expect(setAuthState).toHaveBeenCalledWith({ accessToken: 'new-access-token' });
  });
});
