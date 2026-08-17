import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button } from 'react-native-paper';
import { CatalogScreen } from 'src/features/catalog/CatalogScreen';
import { DetailScreen } from 'src/features/catalog/DetailScreen';
import { CatalogStackParamList } from 'src/navigation/types';
import { useAuth } from 'src/features/auth/useAuth';

const Stack = createNativeStackNavigator<CatalogStackParamList>();

export function CatalogNavigator() {
  const { signOut } = useAuth();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CatalogList"
        component={CatalogScreen}
        options={{
          headerRight: () => (
            <Button mode="text" onPress={() => signOut()}>
              Sign out
            </Button>
          ),
        }}
      />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}