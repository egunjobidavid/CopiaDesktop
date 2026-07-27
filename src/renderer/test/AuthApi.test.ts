import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('../api/client', () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
    get: (...args: any[]) => mockGet(...args),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import { login, refreshToken, getProfile, register, refreshAccessToken } from '../api/auth';

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login posts to /auth/login', async () => {
    mockPost.mockResolvedValue({
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: 'u1', email: 'test@test.com', fullName: 'Test', role: 'admin' },
        tenantId: 't1',
      },
    });
    const result = await login({ email: 'test@test.com', password: 'pass' });
    expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'pass' });
    expect(result.accessToken).toBe('token');
  });

  it('refreshToken posts to /auth/refresh', async () => {
    mockPost.mockResolvedValue({ data: { accessToken: 'new-token' } });
    const result = await refreshToken('refresh-token');
    expect(mockPost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'refresh-token' });
    expect(result.accessToken).toBe('new-token');
  });

  it('getProfile gets /auth/me', async () => {
    mockGet.mockResolvedValue({ data: { id: 'u1', email: 'test@test.com', fullName: 'Test', role: 'MD' } });
    const result = await getProfile();
    expect(mockGet).toHaveBeenCalledWith('/auth/me');
    expect(result.fullName).toBe('Test');
  });

  it('register posts to /auth/register', async () => {
    mockPost.mockResolvedValue({
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: 'u1', email: 'test@test.com', fullName: 'Test', role: 'admin' },
        tenantId: 't1',
      },
    });
    const result = await register({ email: 'test@test.com', password: 'pass', fullName: 'Test', tenantName: 'TestCo' });
    expect(mockPost).toHaveBeenCalledWith('/auth/register', { email: 'test@test.com', password: 'pass', fullName: 'Test', tenantName: 'TestCo' });
    expect(result.accessToken).toBe('token');
  });

  it('refreshAccessToken calls refreshToken and returns accessToken string', async () => {
    mockPost.mockResolvedValue({ data: { accessToken: 'new-token' } });
    const result = await refreshAccessToken('refresh-token');
    expect(result).toBe('new-token');
    expect(mockPost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'refresh-token' });
  });

  it('login throws on network error', async () => {
    mockPost.mockRejectedValue(new Error('Network error'));
    await expect(login({ email: 'test@test.com', password: 'pass' })).rejects.toThrow('Network error');
  });
});
