import { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import type { Product } from 'src/lib/api/types';

export const ROW_HEIGHT = 88;

type ProductRowProps = {
  product: Product;
  onPress: (id: number) => void;
};

function ProductRowComponent({ product, onPress }: ProductRowProps) {
  return (
    <Pressable style={styles.row} onPress={() => onPress(product.id)}>
      <Image
        source={product.thumbnail}
        style={styles.thumbnail}
        recyclingKey={String(product.id)}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {product.title}
        </Text>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </Pressable>
  );
}

export const ProductRow = memo(ProductRowComponent, (prev, next) => {
  return (
    prev.product.id === next.product.id &&
    prev.product.title === next.product.title &&
    prev.product.price === next.product.price &&
    prev.product.thumbnail === next.product.thumbnail
  );
});

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  brand: {
    fontSize: 13,
    color: '#666',
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
  },
});