import { useSessionStore } from 'src/features/auth/sessionStore';
import { getStoredRefreshToken, setStoredRefreshToken, clearStoredRefreshToken } from 'src/lib/auth/secureStorage';
import { setAccessToken } from 'src/lib/api/tokenStore';
import { refreshTokens } from 'src/features/auth/authApi';
import { ApiError, NetworkError } from 'src/lib/api/errors';

type SignInParams = {
  username: string;
  accessToken: string;
  refreshToken: string;
};

export function useAuth() {
  const status = useSessionStore((s) => s.status);
  const username = useSessionStore((s) => s.username);
  const storeSignIn = useSessionStore((s) => s.signIn);
  const storeSignOut = useSessionStore((s) => s.signOut);

  async function signIn({ username, accessToken, refreshToken }: SignInParams) {
    setAccessToken(accessToken);
    await setStoredRefreshToken(refreshToken);
    storeSignIn(username);
  }

  async function signOut() {
    setAccessToken(null);
    await clearStoredRefreshToken();
    storeSignOut();
  }

  // Called once on app start. If a refresh token is stored, exchange it for
  // a fresh access token before showing any screen — this is what the
  // 'checking' status (and the spinner in RootNavigator) is for.
  async function restoreSession() {
    const storedRefreshToken = await getStoredRefreshToken();

    if (!storedRefreshToken) {
      storeSignOut();
      return;
    }

    try {
      const result = await refreshTokens(storedRefreshToken);
      setAccessToken(result.accessToken);
      await setStoredRefreshToken(result.refreshToken);
      // We don't have the username here — DummyJSON's refresh response
      // doesn't include it. Sign in with an empty username rather than
      // adding a second network call just to fetch /auth/me for a display
      // string; nothing in this app currently shows it outside a future
      // profile screen.
      storeSignIn('');
    } catch (error) {
      if (error instanceof NetworkError) {
        // No internet, not necessarily an invalid session. Stay "signed in"
        // with the stale token; the first real request once connectivity
        // returns will 401 and go through the normal refresh-and-replay
        // flow if the token has actually expired.
        storeSignIn('');
        return;
      }

      if (error instanceof ApiError) {
        await clearStoredRefreshToken();
        storeSignOut();
      }
    }
  }

  return { status, username, signIn, signOut, restoreSession };
}