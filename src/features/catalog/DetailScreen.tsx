import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useProduct } from 'src/features/catalog/useProducts';
import type { CatalogStackParamList } from 'src/navigation/types';

type DetailRouteProp = RouteProp<CatalogStackParamList, 'Detail'>;

export function DetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const { productId } = route.params;
  const { data: product, isLoading, isError } = useProduct(productId);

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
      <Text style={styles.title}>{product.title}</Text>
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
  title: { fontSize: 20, fontWeight: '700' },
  brand: { fontSize: 14, color: '#666' },
  price: { fontSize: 18, fontWeight: '600' },
  description: { fontSize: 15, color: '#333', marginTop: 8, lineHeight: 22 },
});