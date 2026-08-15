import { apiFetch } from 'src/lib/api/apiFetch';
import { ApiError } from 'src/lib/api/errors';
import {
  getAccessToken,
  setAccessToken,
  getRefreshPromise,
  setRefreshPromise,
  notifySessionExpired,
} from 'src/lib/api/tokenStore';
import { getStoredRefreshToken, setStoredRefreshToken, clearStoredRefreshToken } from 'src/lib/auth/secureStorage';
import { refreshTokens } from 'src/features/auth/authApi';

type ApiFetchOptions = Parameters<typeof apiFetch>[1];

export async function authenticatedFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const token = getAccessToken();

  try {
    return await apiFetch<T>(path, {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const newAccessToken = await getOrStartRefresh();
    return apiFetch<T>(path, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
    });
  }
}

function getOrStartRefresh(): Promise<string> {
  const existing = getRefreshPromise();
  if (existing) {
    return existing;
  }

  const promise = performRefresh();
  setRefreshPromise(promise);
  return promise;
}

async function performRefresh(): Promise<string> {
  try {
    const storedRefreshToken = await getStoredRefreshToken();
    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    const result = await refreshTokens(storedRefreshToken);
    setAccessToken(result.accessToken);
    await setStoredRefreshToken(result.refreshToken);
    return result.accessToken;
  } catch (error) {
    // Refresh failed for good — expired refresh token, revoked session,
    // whatever. Nothing left to retry: clear what's stored and let
    // whoever registered the handler (App.tsx) decide how the UI reacts.
    await clearStoredRefreshToken();
    notifySessionExpired();
    throw error;
  } finally {
    setRefreshPromise(null);
  }
}