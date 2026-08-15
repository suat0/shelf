import { useEffect } from 'react';
import { RootNavigator } from 'src/navigation/RootNavigator';
import { useAuth } from 'src/features/auth/useAuth';

export default function App() {
  const { restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, []);

  return <RootNavigator />;
}