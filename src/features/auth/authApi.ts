import { apiFetch } from 'src/lib/api/apiFetch';
import type { LoginResponse, RefreshTokenResponse } from 'src/lib/api/types';

export function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

export function refreshTokens(refreshToken: string): Promise<RefreshTokenResponse> {
  return apiFetch<RefreshTokenResponse>('/auth/refresh', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
}