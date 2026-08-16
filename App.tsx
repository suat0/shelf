import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from 'src/navigation/RootNavigator';
import { useAuth } from 'src/features/auth/useAuth';
import { setSessionExpiredHandler } from 'src/lib/api/tokenStore';
import { queryClient } from 'src/lib/queryClient';
import { initSchema } from 'src/lib/db/schema';
import { getCrashlytics, setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';

export default function App() {
  const { restoreSession, signOut } = useAuth();

  useEffect(() => {
    setCrashlyticsCollectionEnabled(getCrashlytics(), true);
    setSessionExpiredHandler(signOut);
    initSchema().then(() => {
      restoreSession();
    });

    return () => setSessionExpiredHandler(null);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}