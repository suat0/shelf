import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from 'src/features/auth/LoginScreen';
import { AuthStackParamList } from 'src/navigation/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}