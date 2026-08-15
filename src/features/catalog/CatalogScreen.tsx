import { useCallback } from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts } from 'src/features/catalog/useProducts';
import { ProductRow, ROW_HEIGHT } from 'src/features/catalog/ProductRow';
import type { CatalogStackParamList } from 'src/navigation/types';
import type { Product } from 'src/lib/api/types';

type CatalogNavigationProp = NativeStackNavigationProp<CatalogStackParamList, 'CatalogList'>;

export function CatalogScreen() {
  const navigation = useNavigation<CatalogNavigationProp>();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useProducts();

  const products = data?.pages.flatMap((page) => page.products) ?? [];

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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
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
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  errorText: { color: '#666' },
  retry: { color: '#007aff', fontWeight: '600' },
  footer: { paddingVertical: 16 },
});