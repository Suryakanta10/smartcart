import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CartButton from './CartButton';

export default function HeaderActions() {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.push('/orders')} hitSlop={8} style={styles.icon}>
        <Ionicons name="receipt-outline" size={22} color="#111" />
      </Pressable>
      <Pressable onPress={() => router.push('/wishlist')} hitSlop={8} style={styles.icon}>
        <Ionicons name="heart-outline" size={24} color="#111" />
      </Pressable>
      <CartButton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { padding: 6, marginRight: 2 },
});