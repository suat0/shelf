import { useEffect } from 'react';
import { RootNavigator } from 'src/navigation/RootNavigator';
import { useAuth } from 'src/features/auth/useAuth';
import { setSessionExpiredHandler } from 'src/lib/api/tokenStore';

export default function App() {
  const { restoreSession, signOut } = useAuth();

  useEffect(() => {
    setSessionExpiredHandler(signOut);
    restoreSession();

    return () => setSessionExpiredHandler(null);
  }, []);

  return <RootNavigator />;
}