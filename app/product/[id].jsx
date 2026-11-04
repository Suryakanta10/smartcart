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
import QuantityStepper from '../../src/components/QuantityStepper';
import ErrorView from '../../src/components/ErrorView';

import { useIsOffline } from '../../src/hooks/useIsOffline';
import OfflineBanner from '../../src/components/OfflineBanner';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const productId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isOffline = useIsOffline();

  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const { data: similar } = useSimilarProducts(product);

  const quantityInCart = useCartStore(
    (state) => state.items.find((item) => item.id === productId)?.quantity ?? 0
  );
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const isWishlisted = useIsWishlisted(productId);
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  const openProduct = useCallback((otherId) => router.push(`/product/${otherId}`), [router]);

  const changeQuantity = useCallback(
    (quantity) => updateQuantity(productId, quantity),
    [updateQuantity, productId]
  );

if (isLoading) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
    </View>
  );
}

if (isError || !product) {
  return (
    <ErrorView
      message={
        isOffline
          ? "You're offline. This product hasn't been saved yet. Connect to the internet to view it."
          : "Couldn't load this product."
      }
      onRetry={refetch}
    />
  );
}

  const finalPrice = getFinalPrice(product.price, product.discountPercentage);
  const hasDiscount = product.discountPercentage >= 1;
  const outOfStock = product.stock <= 0;
  const reachedLimit = quantityInCart >= product.stock;

  let stockLabel = 'In stock';
  if (outOfStock) stockLabel = 'Out of stock';
  else if (product.stock < 10) stockLabel = `Only ${product.stock} left`;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <OfflineBanner />
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
            {product.shippingInformation ? (
              <Text style={styles.info}>🚚 {product.shippingInformation}</Text>
            ) : null}
            {product.warrantyInformation ? (
              <Text style={styles.info}>🛡️ {product.warrantyInformation}</Text>
            ) : null}
            {product.returnPolicy ? <Text style={styles.info}>↩️ {product.returnPolicy}</Text> : null}
          </View>
        </View>

        <SimilarProducts products={similar} onPress={openProduct} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: 12 + insets.bottom }]}>
        {quantityInCart > 0 ? (
          <>
            <View style={styles.cartRow}>
              <QuantityStepper
                quantity={quantityInCart}
                max={product.stock}
                onChange={changeQuantity}
              />
              <Pressable style={styles.goToCart} onPress={() => router.push('/cart')}>
                <Text style={styles.goToCartText}>Go to cart</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
            </View>
            {reachedLimit && (
              <Text style={styles.limitText}>Only {product.stock} available</Text>
            )}
          </>
        ) : (
          <Pressable
            onPress={() => addItem(product)}
            disabled={outOfStock}
            style={[styles.addButton, outOfStock && styles.addButtonDisabled]}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.addButtonText}>{outOfStock ? 'Out of stock' : 'Add to cart'}</Text>
          </Pressable>
        )}
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
  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goToCart: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    height: 46,
    borderRadius: 10,
  },
  goToCartText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  limitText: { fontSize: 12, color: '#d97706', marginTop: 6, textAlign: 'center' },

  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    height: 50,
    borderRadius: 10,
  },
  addButtonDisabled: { backgroundColor: '#aaa' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});