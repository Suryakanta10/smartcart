import { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import QuantityStepper from './QuantityStepper';
import { getFinalPrice, formatPrice } from '../utils/price';

function CartItem({ item, onChangeQuantity, onPress }) {
  const finalPrice = getFinalPrice(item.price, item.discountPercentage);
  const lineTotal = Math.round(finalPrice * item.quantity * 100) / 100;

  const handleQuantityChange = useCallback(
    (quantity) => onChangeQuantity(item.id, quantity),
    [item.id, onChangeQuantity]
  );

  return (
    <View style={styles.card}>
      <Pressable onPress={() => onPress(item.id)}>
        <Image source={item.thumbnail} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />
      </Pressable>

      <View style={styles.info}>
        <Pressable onPress={() => onPress(item.id)}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </Pressable>
        <Text style={styles.unitPrice}>{formatPrice(finalPrice)} each</Text>

        <View style={styles.bottomRow}>
          <QuantityStepper quantity={item.quantity} max={item.stock} onChange={handleQuantityChange} />
          <Text style={styles.lineTotal}>{formatPrice(lineTotal)}</Text>
        </View>
      </View>
    </View>
  );
}

export default memo(CartItem);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    elevation: 1,
  },
  image: { width: 84, height: 84, borderRadius: 8, backgroundColor: '#f1f1f1' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '600', color: '#222' },
  unitPrice: { fontSize: 13, color: '#777', marginTop: 2 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  lineTotal: { fontSize: 16, fontWeight: '700', color: '#111' },
});