import { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useProduct } from '../../src/hooks/useProduct';
import { useSimilarProducts } from '../../src/hooks/useSimilarProducts';
import { useCartStore } from '../../src/store/cartStore';
import { useWishlistStore, useIsWishlisted } from '../../src/store/wishlistStore';
import { getFinalPrice, formatPrice } from '../../src/utils/price';

import ImageGallery from '../../src/components/ImageGallery';
import SimilarProducts from '../../src/components/SimilarProducts';
import ErrorView from '../../src/components/ErrorView';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const productId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const { data: similar } = useSimilarProducts(product);

  const quantityInCart = useCartStore(
    (state) => state.items.find((item) => item.id === productId)?.quantity ?? 0
  );
  const addItem = useCartStore((state) => state.addItem);

  const isWishlisted = useIsWishlisted(productId);
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  const openProduct = useCallback((otherId) => router.push(`/product/${otherId}`), [router]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !product) {
    return <ErrorView message="Couldn't load this product." onRetry={refetch} />;
  }

  const finalPrice = getFinalPrice(product.price, product.discountPercentage);
  const hasDiscount = product.discountPercentage >= 1;
  const outOfStock = product.stock <= 0;
  const reachedLimit = quantityInCart >= product.stock;
  const canAdd = !outOfStock && !reachedLimit;

  let stockLabel = 'In stock';
  if (outOfStock) stockLabel = 'Out of stock';
  else if (product.stock < 10) stockLabel = `Only ${product.stock} left`;

  let buttonLabel = 'Add to cart';
  if (outOfStock) buttonLabel = 'Out of stock';
  else if (reachedLimit) buttonLabel = 'Max quantity in cart';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}>
        <ImageGallery images={product.images} />

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.title}</Text>
            <Pressable onPress={() => toggleWishlist(product)} hitSlop={10}>
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={26}
                color={isWishlisted ? '#e11d48' : '#333'}
              />
            </Pressable>
          </View>

          {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}

          <Text style={styles.rating}>
            ★ {product.rating.toFixed(1)} · {product.reviews?.length ?? 0} reviews
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(finalPrice)}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.oldPrice}>{formatPrice(product.price)}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{Math.round(product.discountPercentage)}% OFF</Text>
                </View>
              </>
            )}
          </View>

          <Text style={[styles.stock, product.stock < 10 && styles.stockLow]}>{stockLabel}</Text>

          <Text style={styles.sectionTitle}>About this product</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.infoBox}>
            {product.shippingInformation ? <Text style={styles.info}>🚚 {product.shippingInformation}</Text> : null}
            {product.warrantyInformation ? <Text style={styles.info}>🛡️ {product.warrantyInformation}</Text> : null}
            {product.returnPolicy ? <Text style={styles.info}>↩️ {product.returnPolicy}</Text> : null}
          </View>
        </View>

        <SimilarProducts products={similar} onPress={openProduct} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: 12 + insets.bottom }]}>
        {quantityInCart > 0 && (
          <Pressable onPress={() => router.push('/cart')} style={styles.inCart}>
            <Text style={styles.inCartText}>In cart: {quantityInCart}</Text>
            <Text style={styles.viewCart}>View cart ›</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => addItem(product)}
          disabled={!canAdd}
          style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
        >
          <Text style={styles.addButtonText}>{buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f6f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: '#111' },
  brand: { fontSize: 14, color: '#666', marginTop: 4 },
  rating: { fontSize: 14, color: '#f59e0b', marginTop: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  price: { fontSize: 24, fontWeight: '800', color: '#111' },
  oldPrice: { fontSize: 15, color: '#999', textDecorationLine: 'line-through' },
  badge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: '#15803d', fontSize: 12, fontWeight: '700' },
  stock: { marginTop: 8, fontSize: 14, color: '#15803d', fontWeight: '600' },
  stockLow: { color: '#d97706' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 6, color: '#111' },
  description: { fontSize: 14, lineHeight: 21, color: '#444' },
  infoBox: { marginTop: 16, gap: 6 },
  info: { fontSize: 13, color: '#555' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inCart: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  inCartText: { fontSize: 13, color: '#444' },
  viewCart: { fontSize: 13, fontWeight: '700', color: '#111' },
  addButton: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  addButtonDisabled: { backgroundColor: '#aaa' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});