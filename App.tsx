import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { RootNavigator } from 'src/navigation/RootNavigator';
import { useAuth } from 'src/features/auth/useAuth';
import { setSessionExpiredHandler } from 'src/lib/api/tokenStore';
import { queryClient } from 'src/lib/queryClient';
import { initSchema } from 'src/lib/db/schema';
import { getCrashlytics, setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';
import { paperTheme } from 'src/ui/theme';

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
      <PaperProvider
        theme={paperTheme}
        settings={{
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
        <RootNavigator />
      </PaperProvider>
    </QueryClientProvider>
  );
}