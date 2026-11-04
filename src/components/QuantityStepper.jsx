import { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function QuantityStepper({ quantity, max, onChange }) {
  const canIncrease = quantity < max;

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={() => onChange(quantity - 1)} hitSlop={6} style={styles.button}>
        <Ionicons name={quantity === 1 ? 'trash-outline' : 'remove'} size={18} color="#111" />
      </Pressable>

      <Text style={styles.value}>{quantity}</Text>

      <Pressable
        onPress={() => onChange(quantity + 1)}
        disabled={!canIncrease}
        hitSlop={6}
        style={[styles.button, !canIncrease && styles.disabled]}
      >
        <Ionicons name="add" size={18} color="#111" />
      </Pressable>
    </View>
  );
}

export default memo(QuantityStepper);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  button: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f6f6' },
  disabled: { opacity: 0.35 },
  value: { minWidth: 36, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#111' },
});