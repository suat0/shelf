import { useSessionStore } from 'src/features/auth/sessionStore';
import { setStoredRefreshToken, clearStoredRefreshToken } from 'src/lib/auth/secureStorage';
import { setAccessToken } from 'src/lib/api/tokenStore';

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

  return { status, username, signIn, signOut };
}