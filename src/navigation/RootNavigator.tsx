import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { AuthNavigator } from 'src/navigation/AuthNavigator';
import { AppTabNavigator } from 'src/navigation/AppTabNavigator';
import { useAuth } from 'src/features/auth/useAuth';

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
    <NavigationContainer>
      {status === 'signedIn' ? <AppTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}