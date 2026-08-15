import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CatalogScreen } from 'src/features/catalog/CatalogScreen';
import { DetailScreen } from 'src/features/catalog/DetailScreen';
import { CatalogStackParamList } from 'src/navigation/types';

const Stack = createNativeStackNavigator<CatalogStackParamList>();

export function CatalogNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CatalogList" component={CatalogScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}