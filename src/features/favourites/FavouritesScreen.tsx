import { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFavourites } from 'src/features/catalog/useFavourites';
import { ProductRow, ROW_HEIGHT } from 'src/features/catalog/ProductRow';
import type { AppTabParamList } from 'src/navigation/types';
import type { Product } from 'src/lib/api/types';
import { crashReporter } from 'src/lib/telemetry';

// Favourites lives in the tab navigator (see AppTabNavigator), not inside
// CatalogNavigator's stack — so it doesn't have a 'Detail' route of its own.
// Tapping a favourited row navigates into the Catalog tab's stack instead.
type FavouritesNavigationProp = NativeStackNavigationProp<AppTabParamList>;

export function FavouritesScreen() {
  const navigation = useNavigation<FavouritesNavigationProp>();
  const { favourites, refresh } = useFavourites();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handlePress = useCallback(
    (id: number) => {
      navigation.navigate('Catalog', { screen: 'Detail', params: { productId: id } });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductRow product={item} onPress={handlePress} />,
    [handlePress],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }),
    [],
  );

  return (
    <View style={{ flex: 1 }}>
      {__DEV__ && (
        <Button
          mode="text"
          textColor="#c00"
          onPress={() => crashReporter.crash()}
          style={styles.crashButton}
        >
          Crash test (dev only)
        </Button>
      )}
      {favourites.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyMedium">No favourites yet.</Text>
        </View>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  crashButton: { backgroundColor: '#fee' },
});