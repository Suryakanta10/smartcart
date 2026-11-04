import { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { getFinalPrice, formatPrice } from '../utils/price';

function WishlistItem({ item, onPress, onRemove, onMoveToCart }) {
  const finalPrice = getFinalPrice(item.price, item.discountPercentage);
  const outOfStock = !item.stock || item.stock <= 0;

  return (
    <Pressable style={styles.card} onPress={() => onPress(item.id)}>
      <Image source={item.thumbnail} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.rating}>★ {item.rating?.toFixed(1)}</Text>
        <Text style={styles.price}>{formatPrice(finalPrice)}</Text>

        <View style={styles.actions}>
          <Pressable
            onPress={() => onMoveToCart(item)}
            disabled={outOfStock}
            style={[styles.moveButton, outOfStock && styles.moveButtonDisabled]}
          >
            <Text style={styles.moveText}>{outOfStock ? 'Out of stock' : 'Move to cart'}</Text>
          </Pressable>
          <Pressable onPress={() => onRemove(item.id)} hitSlop={10}>
            <Ionicons name="trash-outline" size={20} color="#888" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(WishlistItem);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    elevation: 1,
  },
  image: { width: 92, height: 92, borderRadius: 8, backgroundColor: '#f1f1f1' },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '600', color: '#222' },
  rating: { fontSize: 13, color: '#f59e0b', marginTop: 4 },
  price: { fontSize: 16, fontWeight: '700', color: '#111', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  moveButton: { backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  moveButtonDisabled: { backgroundColor: '#aaa' },
  moveText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});