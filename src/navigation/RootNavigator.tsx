import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { AuthNavigator } from 'src/navigation/AuthNavigator';
import { AppTabNavigator } from 'src/navigation/AppTabNavigator';
import { useAuth } from 'src/features/auth/useAuth';
import { navigationTheme } from 'src/ui/theme';

export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {status === 'signedIn' ? <AppTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}