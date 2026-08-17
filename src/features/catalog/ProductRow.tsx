import { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'react-native-paper';
import type { Product } from 'src/lib/api/types';

export const ROW_HEIGHT = 88;

type ProductRowProps = {
  product: Product;
  onPress: (id: number) => void;
};

function ProductRowComponent({ product, onPress }: ProductRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(product.id)}
    >
      <Image
        source={product.thumbnail}
        style={styles.thumbnail}
        recyclingKey={String(product.id)}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text variant="titleSmall" numberOfLines={1}>
          {product.title}
        </Text>
        <Text variant="bodySmall" style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text variant="labelLarge">${product.price.toFixed(2)}</Text>
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
  rowPressed: {
    opacity: 0.6,
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
  brand: {
    opacity: 0.6,
  },
});