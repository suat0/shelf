import { useCallback, useEffect, useState } from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts } from 'src/features/catalog/useProducts';
import { useCachedProducts } from 'src/features/catalog/useCachedProducts';
import { useSearch } from 'src/features/catalog/useSearch';
import { SearchBar } from 'src/features/catalog/SearchBar';
import { ProductRow, ROW_HEIGHT } from 'src/features/catalog/ProductRow';
import type { CatalogStackParamList } from 'src/navigation/types';
import type { Product } from 'src/lib/api/types';
import { analytics } from 'src/lib/telemetry';

type CatalogNavigationProp = NativeStackNavigationProp<CatalogStackParamList, 'CatalogList'>;

export function CatalogScreen() {
  const navigation = useNavigation<CatalogNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const cachedProducts = useCachedProducts();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useProducts();
  const searchQuery = useSearch(searchText);

  const isSearching = searchText.trim().length > 0;

  const networkProducts = data?.pages.flatMap((page) => page.products);
  const products = networkProducts ?? cachedProducts;
  const showingCacheOnly = !networkProducts && cachedProducts.length > 0;

  useEffect(() => {
  if (showingCacheOnly || isError) {
    analytics.logEvent('offline_render');
  }
}, [showingCacheOnly, isError]);

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
    (_: unknown, index: number) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }),
    [],
  );

  // Search mode: a completely separate render path. Search results don't
  // paginate or use the offline cache — SPEC.md scopes search to the
  // server-side endpoint, not a cached/offline concern.
  if (isSearching) {
    const searchResults = searchQuery.data?.products ?? [];

    return (
      <View style={{ flex: 1 }}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
        {searchQuery.isLoading || searchQuery.isDebouncing ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.center}>
            <Text>No results for "{searchText}".</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
          />
        )}
      </View>
    );
  }

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

  return (
    <View style={{ flex: 1 }}>
      <SearchBar value={searchText} onChangeText={setSearchText} />
      {(isError || showingCacheOnly) && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>You're offline. Showing saved products.</Text>
        </View>
      )}
      {products.length === 0 ? (
        <View style={styles.center}>
          <Text>No products found.</Text>
        </View>
      ) : (
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
      )}
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