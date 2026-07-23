import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://copiaos-backend.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- Auth state managed on the axios instance (no circular dependency) ----
// Previously, this module imported useAuthStore from auth.store, creating
// auth.store → api/auth → api/client → auth.store. That circular chain caused
// React error #300 during synchronous render flushes because the bundler could
// resolve the circular reference to an incomplete module binding.

let _accessToken: string | null = null;
let _tenantId: string | null = null;
let _refreshToken: string | null = null;
let _refreshAccessToken: (() => Promise<string>) | null = null;
let _logout: (() => void) | null = null;

export function setAuthState(opts: {
  accessToken?: string | null;
  tenantId?: string | null;
  refreshToken?: string | null;
  refreshAccessToken?: () => Promise<string>;
  logout?: () => void;
}) {
  if (opts.accessToken !== undefined) _accessToken = opts.accessToken;
  if (opts.tenantId !== undefined) _tenantId = opts.tenantId;
  if (opts.refreshToken !== undefined) _refreshToken = opts.refreshToken;
  if (opts.refreshAccessToken) _refreshAccessToken = opts.refreshAccessToken;
  if (opts.logout) _logout = opts.logout;
}

// Request interceptor — attach JWT + tenant-id
api.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    if (_tenantId) {
      config.headers['x-tenant-id'] = _tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

let offlineQueue: Array<() => void> = [];

window.addEventListener('online', () => {
  const queue = [...offlineQueue];
  offlineQueue = [];
  queue.forEach((fn) => fn());
});

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (!navigator.onLine) {
      return new Promise((resolve) => {
        offlineQueue.push(() => resolve(api(error.config)));
      });
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._skipAuth) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (!_refreshAccessToken) throw new Error('No refresh handler');
        const newToken = await _refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Defer logout to avoid mid-render state changes that trigger ErrorBoundary.
        setTimeout(() => _logout?.(), 0);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
