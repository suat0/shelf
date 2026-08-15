import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CatalogNavigator } from 'src/navigation/CatalogNavigator';
import { FavouritesScreen } from 'src/features/favourites/FavouritesScreen';
import { AppTabParamList } from 'src/navigation/types';

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Catalog" component={CatalogNavigator} />
      <Tab.Screen name="Favourites" component={FavouritesScreen} />
    </Tab.Navigator>
  );
}