import api from './client';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  tenantId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials);
  return data;
}

export async function refreshToken(token: string): Promise<{ accessToken: string }> {
  const { data } = await api.post<{ accessToken: string }>('/auth/refresh', {
    refreshToken: token,
  });
  return data;
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/auth/me');
  return data;
}

export async function register(dto: {
  email: string;
  password: string;
  fullName: string;
  tenantName: string;
  tenantAddress?: string;
  tenantCity?: string;
  tenantState?: string;
  tenantCountry?: string;
  tenantPostalCode?: string;
  tenantPhone?: string;
  tenantServices?: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/register', dto);
  return data;
}

export async function refreshAccessToken(
  refreshTokenValue: string,
): Promise<string> {
  const result = await refreshToken(refreshTokenValue);
  return result.accessToken;
}
