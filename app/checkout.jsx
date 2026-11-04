import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useCartStore } from '../src/store/cartStore';
import { useOrderStore } from '../src/store/orderStore';
import { getCartTotals } from '../src/utils/cart';
import { formatPrice } from '../src/utils/price';
import { validateCheckout } from '../src/utils/validation';
import { createOrder } from '../src/utils/order';
import EmptyState from '../src/components/EmptyState';

const EMPTY_FORM = { fullName: '', phone: '', address: '', city: '', pincode: '' };

const PAYMENT_METHODS = [
  { key: 'cod', label: 'Cash on Delivery', icon: 'cash-outline' },
  { key: 'upi', label: 'UPI', icon: 'phone-portrait-outline' },
  { key: 'card', label: 'Card', icon: 'card-outline' },
];

function Field({ label, error, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#aaa"
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((state) => state.addOrder);
  const savedAddress = useOrderStore((state) => state.savedAddress);

  const [form, setForm] = useState(() => savedAddress ?? EMPTY_FORM);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [placing, setPlacing] = useState(false);

  const totals = useMemo(() => getCartTotals(items), [items]);

  const updateField = (field, value) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    if (submitted) setErrors(validateCheckout(nextForm));
  };

  const placeOrder = async () => {
    setSubmitted(true);
    const validationErrors = validateCheckout(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setPlacing(true);

    // There is no real payment gateway, so we just simulate a short processing delay.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const cleanAddress = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()])
    );
    const order = createOrder({ items, address: cleanAddress, paymentMethod });

    addOrder(order);
    clearCart();
    router.replace({ pathname: '/order/[id]', params: { id: order.id, fresh: '1' } });
  };

  if (items.length === 0 && !placing) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Nothing to checkout"
        message="Your cart is empty."
        actionLabel="Start shopping"
        onAction={() => router.dismissTo('/')}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Delivery address</Text>
        <View style={styles.card}>
          <Field
            label="Full name"
            value={form.fullName}
            onChangeText={(text) => updateField('fullName', text)}
            error={errors.fullName}
            placeholder="Suresh Kumar"
            autoCapitalize="words"
          />
          <Field
            label="Mobile number"
            value={form.phone}
            onChangeText={(text) => updateField('phone', text.replace(/\D/g, ''))}
            error={errors.phone}
            placeholder="9876543210"
            keyboardType="number-pad"
            maxLength={10}
          />
          <Field
            label="Address"
            value={form.address}
            onChangeText={(text) => updateField('address', text)}
            error={errors.address}
            placeholder="House no, street, area"
            multiline
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Field
                label="City"
                value={form.city}
                onChangeText={(text) => updateField('city', text)}
                error={errors.city}
                placeholder="Bhubaneswar"
              />
            </View>
            <View style={styles.flex}>
              <Field
                label="Pincode"
                value={form.pincode}
                onChangeText={(text) => updateField('pincode', text.replace(/\D/g, ''))}
                error={errors.pincode}
                placeholder="751001"
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment method</Text>
        <View style={styles.card}>
          {PAYMENT_METHODS.map((method) => {
            const selected = method.key === paymentMethod;
            return (
              <Pressable
                key={method.key}
                onPress={() => setPaymentMethod(method.key)}
                style={[styles.payment, selected && styles.paymentSelected]}
              >
                <Ionicons name={method.icon} size={20} color="#111" />
                <Text style={styles.paymentLabel}>{method.label}</Text>
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selected ? '#111' : '#aaa'}
                />
              </Pressable>
            );
          })}
          <Text style={styles.note}>This is a demo. No real payment is made.</Text>
        </View>

        <Text style={styles.sectionTitle}>Order summary</Text>
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({totals.itemCount})</Text>
            <Text style={styles.summaryValue}>{formatPrice(totals.subtotal)}</Text>
          </View>
          {totals.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.green]}>− {formatPrice(totals.discount)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={[styles.summaryValue, styles.green]}>Free</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(totals.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <Pressable
          style={[styles.placeButton, placing && styles.placeButtonDisabled]}
          onPress={placeOrder}
          disabled={placing}
        >
          {placing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeText}>Place order · {formatPrice(totals.total)}</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f6f6' },
  content: { padding: 12, paddingBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginTop: 8, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12 },

  field: { marginBottom: 12 },
  label: { fontSize: 13, color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
  },
  inputError: { borderColor: '#e11d48' },
  error: { color: '#e11d48', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },

  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginBottom: 8,
  },
  paymentSelected: { borderColor: '#111', backgroundColor: '#fafafa' },
  paymentLabel: { flex: 1, fontSize: 15, color: '#111' },
  note: { fontSize: 12, color: '#888', marginTop: 4 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: '#555' },
  summaryValue: { fontSize: 14, color: '#111' },
  green: { color: '#15803d', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#111' },

  footer: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  placeButton: { backgroundColor: '#111', height: 52, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  placeButtonDisabled: { opacity: 0.7 },
  placeText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});