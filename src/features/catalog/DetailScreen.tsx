import { View, ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
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
        <Text variant="bodyMedium" style={styles.errorText}>
          Couldn&apos;t load this product.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={product.thumbnail} style={styles.image} contentFit="cover" />
      <View style={styles.titleRow}>
        <Text variant="headlineSmall" style={styles.title}>
          {product.title}
        </Text>
        <IconButton
          icon={favourited ? 'star' : 'star-outline'}
          iconColor={favourited ? '#f5a623' : undefined}
          size={28}
          onPress={() => toggle(product)}
        />
      </View>
      <Text variant="bodyMedium" style={styles.brand}>
        {product.brand}
      </Text>
      <Text variant="titleLarge">${product.price.toFixed(2)}</Text>
      <Text variant="bodyLarge" style={styles.description}>
        {product.description}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { opacity: 0.6 },
  container: { padding: 16, gap: 8 },
  image: { width: '100%', height: 240, borderRadius: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { flex: 1 },
  brand: { opacity: 0.6 },
  description: { marginTop: 8, lineHeight: 22 },
});