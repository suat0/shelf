import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useProduct } from 'src/features/catalog/useProducts';
import { useIsFavourite } from 'src/features/catalog/useFavourites';
import type { CatalogStackParamList } from 'src/navigation/types';
import { analytics } from 'src/lib/telemetry';
import { useEffect } from 'react';

type DetailRouteProp = RouteProp<CatalogStackParamList, 'Detail'>;

export function DetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const { productId } = route.params;
  const { data: product, isLoading, isError } = useProduct(productId);
  const { favourited, toggle } = useIsFavourite(productId);

  useEffect(() => {
    if (product) {
      analytics.logEvent('product_opened', { productId: product.id });
    }
  }, [product]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Couldn't load this product.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={product.thumbnail} style={styles.image} contentFit="cover" />
      <View style={styles.titleRow}>
        <Text style={styles.title}>{product.title}</Text>
        <Pressable onPress={() => toggle(product)} hitSlop={8}>
          <Text style={styles.favouriteIcon}>{favourited ? '★' : '☆'}</Text>
        </Pressable>
      </View>
      <Text style={styles.brand}>{product.brand}</Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      <Text style={styles.description}>{product.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#666' },
  container: { padding: 16, gap: 8 },
  image: { width: '100%', height: 240, borderRadius: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', flex: 1 },
  favouriteIcon: { fontSize: 28, color: '#f5a623' },
  brand: { fontSize: 14, color: '#666' },
  price: { fontSize: 18, fontWeight: '600' },
  description: { fontSize: 15, color: '#333', marginTop: 8, lineHeight: 22 },
});