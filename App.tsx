import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from 'src/navigation/RootNavigator';
import { useAuth } from 'src/features/auth/useAuth';
import { setSessionExpiredHandler } from 'src/lib/api/tokenStore';
import { queryClient } from 'src/lib/queryClient';

export default function App() {
  const { restoreSession, signOut } = useAuth();

  useEffect(() => {
    setSessionExpiredHandler(signOut);
    restoreSession();

    return () => setSessionExpiredHandler(null);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}