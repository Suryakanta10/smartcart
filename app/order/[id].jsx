import { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, BackHandler, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { useOrderStore } from '../../src/store/orderStore';
import { formatPrice } from '../../src/utils/price';
import { formatOrderDate } from '../../src/utils/date';
import EmptyState from '../../src/components/EmptyState';

const PAYMENT_LABELS = { cod: 'Cash on Delivery', upi: 'UPI', card: 'Card' };

export default function OrderDetailsScreen() {
  const { id, fresh } = useLocalSearchParams();
  const isNewOrder = fresh === '1';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const order = useOrderStore((state) => state.orders.find((o) => o.id === id));

  // After placing an order, the hardware back button should take the user home,
  // not back to an empty cart.
  useFocusEffect(
    useCallback(() => {
      if (!isNewOrder) return undefined;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        router.dismissTo('/');
        return true;
      });
      return () => subscription.remove();
    }, [isNewOrder, router])
  );

  if (!order) {
    return (
      <EmptyState
        icon="receipt-outline"
        title="Order not found"
        actionLabel="Go home"
        onAction={() => router.dismissTo('/')}
      />
    );
  }

  const { address, totals } = order;

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: isNewOrder ? 'Order placed' : `Order #${order.id}`,
          headerBackVisible: !isNewOrder,
        }}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>
        {isNewOrder && (
          <View style={styles.success}>
            <Ionicons name="checkmark-circle" size={72} color="#16a34a" />
            <Text style={styles.successTitle}>Thank you! Your order is confirmed.</Text>
            <Text style={styles.successSub}>Order #{order.id}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={item.thumbnail} style={styles.thumb} contentFit="cover" cachePolicy="memory-disk" />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {formatPrice(Math.round(item.unitPrice * item.quantity * 100) / 100)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>{formatPrice(totals.subtotal)}</Text>
          </View>
          {totals.discount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Discount</Text>
              <Text style={[styles.value, styles.green]}>− {formatPrice(totals.discount)}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.totalLabel}>{formatPrice(totals.total)}</Text>
          </View>
          <Text style={styles.meta}>{PAYMENT_LABELS[order.paymentMethod]}</Text>
          <Text style={styles.meta}>{formatOrderDate(order.createdAt)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivering to</Text>
          <Text style={styles.addressName}>{address.fullName}</Text>
          <Text style={styles.addressLine}>{address.address}</Text>
          <Text style={styles.addressLine}>
            {address.city} - {address.pincode}
          </Text>
          <Text style={styles.addressLine}>📞 {address.phone}</Text>
        </View>

        {isNewOrder && (
          <View style={styles.actions}>
            <Pressable style={styles.primary} onPress={() => router.dismissTo('/')}>
              <Text style={styles.primaryText}>Continue shopping</Text>
            </Pressable>
            <Pressable style={styles.secondary} onPress={() => router.push('/orders')}>
              <Text style={styles.secondaryText}>View all orders</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f6f6' },
  content: { padding: 12 },

  success: { alignItems: 'center', paddingVertical: 24 },
  successTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 12, textAlign: 'center' },
  successSub: { fontSize: 14, color: '#666', marginTop: 4 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 10 },

  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  thumb: { width: 48, height: 48, borderRadius: 6, backgroundColor: '#f1f1f1' },
  itemInfo: { flex: 1, marginHorizontal: 10 },
  itemTitle: { fontSize: 14, color: '#222', fontWeight: '600' },
  itemMeta: { fontSize: 13, color: '#777', marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#111' },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, color: '#555' },
  value: { fontSize: 14, color: '#111' },
  green: { color: '#15803d', fontWeight: '600' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111' },
  meta: { fontSize: 13, color: '#777', marginTop: 4 },

  addressName: { fontSize: 15, fontWeight: '600', color: '#111' },
  addressLine: { fontSize: 14, color: '#555', marginTop: 2 },

  actions: { gap: 10, marginTop: 4 },
  primary: { backgroundColor: '#111', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: { borderWidth: 1, borderColor: '#111', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  secondaryText: { color: '#111', fontSize: 16, fontWeight: '700' },
});