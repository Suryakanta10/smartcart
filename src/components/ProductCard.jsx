import { memo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { getFinalPrice, formatPrice } from '../utils/price';

const CARD_HEIGHT = 112;
const CARD_GAP = 12;
export const ITEM_HEIGHT = CARD_HEIGHT + CARD_GAP;

function ProductCard({ product, onPress }) {
  const finalPrice = getFinalPrice(product.price, product.discountPercentage);
  const hasDiscount = product.discountPercentage > 0;

  return (
    <Pressable style={styles.card} onPress={() => onPress(product.id)}>
      <Image
        source={product.thumbnail}
        style={styles.image}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(finalPrice)}</Text>
          {hasDiscount && <Text style={styles.oldPrice}>{formatPrice(product.price)}</Text>}
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    marginBottom: CARD_GAP,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  image: { width: 92, height: 92, borderRadius: 8, backgroundColor: '#f1f1f1' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '600', color: '#222' },
  rating: { fontSize: 13, color: '#f59e0b' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { fontSize: 16, fontWeight: '700', color: '#111' },
  oldPrice: { fontSize: 13, color: '#999', textDecorationLine: 'line-through' },
});