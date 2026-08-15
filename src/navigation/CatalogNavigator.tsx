import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';
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
            <Pressable onPress={() => signOut()}>
              <Text style={{ color: '#007aff' }}>Sign out</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}