import { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useWishlistStore } from '../src/store/wishlistStore';
import { useCartStore } from '../src/store/cartStore';
import WishlistItem from '../src/components/WishlistItem';
import EmptyState from '../src/components/EmptyState';

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = useWishlistStore((state) => state.items);
  const removeFromWishlist = useWishlistStore((state) => state.remove);
  const addToCart = useCartStore((state) => state.addItem);

  const openProduct = useCallback((id) => router.push(`/product/${id}`), [router]);

  const moveToCart = useCallback(
    (product) => {
      addToCart(product);
      removeFromWishlist(product.id);
    },
    [addToCart, removeFromWishlist]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <WishlistItem
        item={item}
        onPress={openProduct}
        onRemove={removeFromWishlist}
        onMoveToCart={moveToCart}
      />
    ),
    [openProduct, removeFromWishlist, moveToCart]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  if (items.length === 0) {
    return (
      <EmptyState
        icon="heart-outline"
        title="Your wishlist is empty"
        message="Tap the heart on any product to save it here."
        actionLabel="Browse products"
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
        contentContainerStyle={[styles.list, { paddingBottom: 24 + insets.bottom }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f6f6' },
  list: { padding: 12 },
});