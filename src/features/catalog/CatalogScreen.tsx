import { useCallback } from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts } from 'src/features/catalog/useProducts';
import { useCachedProducts } from 'src/features/catalog/useCachedProducts';
import { ProductRow, ROW_HEIGHT } from 'src/features/catalog/ProductRow';
import type { CatalogStackParamList } from 'src/navigation/types';
import type { Product } from 'src/lib/api/types';

type CatalogNavigationProp = NativeStackNavigationProp<CatalogStackParamList, 'CatalogList'>;

export function CatalogScreen() {
  const navigation = useNavigation<CatalogNavigationProp>();
  const cachedProducts = useCachedProducts();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useProducts();

  const networkProducts = data?.pages.flatMap((page) => page.products);
  // Network data wins once it arrives (it's the source of truth); until
  // then, or if the network never succeeds, cached rows fill the screen
  // instead of nothing. This is the "reconcile" half of read-through.
  const products = networkProducts ?? cachedProducts;
  const showingCacheOnly = !networkProducts && cachedProducts.length > 0;
    console.log('[Catalog]', {
  isError,
  showingCacheOnly,
  networkProductsCount: networkProducts?.length,
  cachedCount: cachedProducts.length,
});
  const handlePress = useCallback(
    (id: number) => {
      navigation.navigate('Detail', { productId: id });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductRow product={item} onPress={handlePress} />,
    [handlePress],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  // Only show the full-screen spinner if we have nothing at all to show —
  // if cache has rows, show those instead of blocking on the network.
  if (isLoading && cachedProducts.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError && cachedProducts.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Couldn't load products.</Text>
        <Text style={styles.retry} onPress={() => refetch()}>
          Retry
        </Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No products found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {(isError || showingCacheOnly) && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>You're offline. Showing saved products.</Text>
        </View>
      )}
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  errorText: { color: '#666' },
  retry: { color: '#007aff', fontWeight: '600' },
  footer: { paddingVertical: 16 },
  offlineBanner: { backgroundColor: '#fff3cd', padding: 8, alignItems: 'center' },
  offlineBannerText: { color: '#856404', fontSize: 13 },
});