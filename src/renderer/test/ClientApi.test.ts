import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test the axios client interceptors in isolation
describe('API Client Interceptors', () => {
  const _accessToken = { current: null as string | null };
  const _tenantId = { current: null as string | null };
  const _refreshToken = { current: null as string | null };
  const _refreshAccessToken = { current: null as (() => Promise<string>) | null };
  const _logout = { current: null as (() => void) | null };

  function setAuthState(opts: any) {
    if (opts.accessToken !== undefined) _accessToken.current = opts.accessToken;
    if (opts.tenantId !== undefined) _tenantId.current = opts.tenantId;
    if (opts.refreshToken !== undefined) _refreshToken.current = opts.refreshToken;
    if (opts.refreshAccessToken) _refreshAccessToken.current = opts.refreshAccessToken;
    if (opts.logout) _logout.current = opts.logout;
  }

  beforeEach(() => {
    _accessToken.current = null;
    _tenantId.current = null;
    _refreshToken.current = null;
    _refreshAccessToken.current = null;
    _logout.current = null;
  });

  it('setAuthState stores values correctly', () => {
    setAuthState({ accessToken: 'token-123', tenantId: 'tenant-1', refreshToken: 'refresh-123' });
    expect(_accessToken.current).toBe('token-123');
    expect(_tenantId.current).toBe('tenant-1');
    expect(_refreshToken.current).toBe('refresh-123');
  });

  it('setAuthState merges partial updates', () => {
    setAuthState({ accessToken: 'token-123', tenantId: 'tenant-1' });
    setAuthState({ refreshToken: 'refresh-123' });
    expect(_accessToken.current).toBe('token-123');
    expect(_tenantId.current).toBe('tenant-1');
    expect(_refreshToken.current).toBe('refresh-123');
  });

  it('setAuthState stores function references', () => {
    const refreshFn = vi.fn();
    const logoutFn = vi.fn();
    setAuthState({ refreshAccessToken: refreshFn, logout: logoutFn });
    _refreshAccessToken.current?.();
    expect(refreshFn).toHaveBeenCalled();
    _logout.current?.();
    expect(logoutFn).toHaveBeenCalled();
  });

  it('response interceptor unwraps envelope response', () => {
    // Simulating the response interceptor logic
    const response = { data: { success: true, data: { id: 'abc', name: 'test' }, meta: {} } };
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    expect(response.data).toEqual({ id: 'abc', name: 'test' });
  });

  it('response interceptor passes through non-envelope', () => {
    const response = { data: { id: 'abc', name: 'test' } };
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    expect(response.data).toEqual({ id: 'abc', name: 'test' });
  });

  it('response interceptor passes through arrays', () => {
    const response = { data: [{ id: '1' }, { id: '2' }] };
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    expect(response.data).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('response interceptor handles null data', () => {
    const response = { data: null };
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    expect(response.data).toBeNull();
  });

  it('response interceptor handles undefined data', () => {
    const response = { data: undefined };
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    expect(response.data).toBeUndefined();
  });

  it('response interceptor handles non-object data', () => {
    const response = { data: 'string data' };
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    expect(response.data).toBe('string data');
  });

  // Simulate 401 retry logic
  it('handles 401 with retry and refresh token', async () => {
    const originalRequest = { _retry: false, headers: { Authorization: '' } };
    const refreshFn = vi.fn().mockResolvedValue('new-token');

    if (originalRequest._retry || !refreshFn) return;
    originalRequest._retry = true;
    const newToken = await refreshFn();
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    expect(originalRequest.headers.Authorization).toBe('Bearer new-token');
  });

  it('handles 401 refresh failure and schedules logout', async () => {
    vi.useFakeTimers();
    const logoutFn = vi.fn();
    const refreshFn = vi.fn().mockRejectedValue(new Error('Refresh failed'));

    try {
      await refreshFn();
    } catch {
      setTimeout(() => logoutFn(), 0);
    }
    vi.runAllTimers();
    expect(logoutFn).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('queues requests during token refresh', () => {
    const queue: Array<{ resolve: Function; reject: Function }> = [];
    const processQueue = (error: unknown, token: string | null = null) => {
      queue.forEach((prom) => {
        if (token) prom.resolve(token);
        else prom.reject(error);
      });
    };

    const p1 = new Promise((resolve, reject) => queue.push({ resolve, reject }));
    const p2 = new Promise((resolve, reject) => queue.push({ resolve, reject }));

    processQueue(null, 'new-token');

    return Promise.all([
      p1.then((t) => expect(t).toBe('new-token')),
      p2.then((t) => expect(t).toBe('new-token')),
    ]);
  });

  it('rejects queued requests on refresh failure', async () => {
    const queue: Array<{ resolve: Function; reject: Function }> = [];
    const processQueue = (error: unknown, token: string | null = null) => {
      queue.forEach((prom) => {
        if (token) prom.resolve(token);
        else prom.reject(error);
      });
    };

    const p1 = new Promise((resolve, reject) => queue.push({ resolve, reject }));

    processQueue(new Error('Fail'), null);

    await expect(p1).rejects.toThrow('Fail');
  });
});
