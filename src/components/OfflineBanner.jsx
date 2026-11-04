import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsOffline } from '../hooks/useIsOffline';

export default function OfflineBanner({ message = "You're offline. Showing saved data." }) {
  const isOffline = useIsOffline();
  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: { color: '#fff', fontSize: 13, flex: 1 },
});