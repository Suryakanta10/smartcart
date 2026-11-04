import { memo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { useOrderStore } from '../src/store/orderStore';
import { formatPrice } from '../src/utils/price';
import { formatOrderDate } from '../src/utils/date';
import EmptyState from '../src/components/EmptyState';

const OrderCard = memo(function OrderCard({ order, onPress }) {
  const previewImages = order.items.slice(0, 3);
  const extra = order.items.length - previewImages.length;

  return (
    <Pressable style={styles.card} onPress={() => onPress(order.id)}>
      <View style={styles.header}>
        <Text style={styles.orderId}>#{order.id}</Text>
        <View style={styles.status}>
          <Text style={styles.statusText}>Confirmed</Text>
        </View>
      </View>
      <Text style={styles.date}>{formatOrderDate(order.createdAt)}</Text>

      <View style={styles.previewRow}>
        {previewImages.map((item) => (
          <Image key={item.id} source={item.thumbnail} style={styles.preview} contentFit="cover" cachePolicy="memory-disk" />
        ))}
        {extra > 0 && <Text style={styles.extra}>+{extra}</Text>}
      </View>

      <View style={styles.footer}>
        <Text style={styles.count}>
          {order.totals.itemCount} {order.totals.itemCount === 1 ? 'item' : 'items'}
        </Text>
        <View style={styles.totalRow}>
          <Text style={styles.total}>{formatPrice(order.totals.total)}</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </View>
      </View>
    </Pressable>
  );
});

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const orders = useOrderStore((state) => state.orders);

  const openOrder = useCallback((id) => router.push(`/order/${id}`), [router]);

  const renderItem = useCallback(
    ({ item }) => <OrderCard order={item} onPress={openOrder} />,
    [openOrder]
  );

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="receipt-outline"
        title="No orders yet"
        message="Your past purchases will show up here."
        actionLabel="Start shopping"
        onAction={() => router.dismissTo('/')}
      />
    );
  }

  return (
    <FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.screen}
      contentContainerStyle={[styles.list, { paddingBottom: 24 + insets.bottom }]}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f6f6' },
  list: { padding: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 15, fontWeight: '700', color: '#111' },
  status: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { color: '#15803d', fontSize: 12, fontWeight: '700' },
  date: { fontSize: 13, color: '#777', marginTop: 4 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  preview: { width: 48, height: 48, borderRadius: 6, backgroundColor: '#f1f1f1' },
  extra: { fontSize: 14, color: '#555', fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  count: { fontSize: 14, color: '#555' },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  total: { fontSize: 16, fontWeight: '800', color: '#111' },
});