import { useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCartStore } from '../src/store/cartStore';
import { getCartTotals } from '../src/utils/cart';
import { formatPrice } from '../src/utils/price';
import CartItem from '../src/components/CartItem';
import EmptyState from '../src/components/EmptyState';

function SummaryRow({ label, value, bold, valueStyle }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.bold, valueStyle]}>{value}</Text>
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const totals = useMemo(() => getCartTotals(items), [items]);

  const openProduct = useCallback((id) => router.push(`/product/${id}`), [router]);

  const renderItem = useCallback(
    ({ item }) => <CartItem item={item} onChangeQuantity={updateQuantity} onPress={openProduct} />,
    [updateQuantity, openProduct]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  const confirmClear = useCallback(() => {
    Alert.alert('Clear cart?', 'All items will be removed from your cart.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  }, [clearCart]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Your cart is empty"
        message="Looks like you haven't added anything yet."
        actionLabel="Start shopping"
        onAction={() => router.dismissTo('/')}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.itemCount}>
              {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
            </Text>
            <Pressable onPress={confirmClear} hitSlop={8}>
              <Text style={styles.clear}>Clear cart</Text>
            </Pressable>
          </View>
        }
      />

      <View style={[styles.summary, { paddingBottom: 12 + insets.bottom }]}>
        <SummaryRow label="Subtotal" value={formatPrice(totals.subtotal)} />
        {totals.discount > 0 && (
          <SummaryRow
            label="Discount"
            value={`− ${formatPrice(totals.discount)}`}
            valueStyle={styles.discount}
          />
        )}
        <SummaryRow label="Delivery" value="Free" valueStyle={styles.discount} />
        <View style={styles.divider} />
        <SummaryRow label="Total" value={formatPrice(totals.total)} bold />

        <Pressable style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
          <Text style={styles.checkoutText}>Proceed to checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f6f6' },
  list: { padding: 12 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemCount: { fontSize: 14, color: '#555' },
  clear: { fontSize: 14, color: '#e11d48', fontWeight: '600' },

  summary: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: '#555' },
  summaryValue: { fontSize: 14, color: '#111' },
  bold: { fontSize: 17, fontWeight: '800', color: '#111' },
  discount: { color: '#15803d', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },

  checkoutButton: {
    marginTop: 10,
    backgroundColor: '#111',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});