import { memo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { getFinalPrice, formatPrice } from '../utils/price';

function SimilarProducts({ products, onPress }) {
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Similar products</Text>
      <FlatList
        horizontal
        data={products}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onPress(item.id)}>
            <Image
              source={item.thumbnail}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.price}>
              {formatPrice(getFinalPrice(item.price, item.discountPercentage))}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

export default memo(SimilarProducts);

const styles = StyleSheet.create({
  section: { marginTop: 8 },
  heading: { fontSize: 17, fontWeight: '700', marginHorizontal: 16, marginBottom: 10, color: '#111' },
  list: { paddingHorizontal: 16, gap: 12 },
  card: { width: 130, backgroundColor: '#fff', borderRadius: 10, padding: 8, elevation: 1 },
  image: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#f3f3f3' },
  title: { fontSize: 13, marginTop: 6, color: '#222', height: 34 },
  price: { fontSize: 14, fontWeight: '700', marginTop: 4, color: '#111' },
});