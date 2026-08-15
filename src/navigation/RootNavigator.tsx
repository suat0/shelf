import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from 'src/navigation/AuthNavigator';
import { AppTabNavigator } from 'src/navigation/AppTabNavigator';

// TODO(S3): Replace this with real auth state from the session store.
// Hardcoded false for now so the navigation tree can be built and tested
// end to end before the auth feature exists.
const isLoggedIn = false;

export function RootNavigator() {
  return (
    <NavigationContainer>
      {isLoggedIn ? <AppTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}