import { useCallback, useMemo, useState } from 'react';
import { FlatList, View, ActivityIndicator, RefreshControl, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useProducts } from '../src/hooks/useProducts';
import ProductCard, { ITEM_HEIGHT } from '../src/components/ProductCard';
import ErrorView from '../src/components/ErrorView';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts();

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data]
  );

  const openProduct = useCallback((id) => router.push(`/product/${id}`), [router]);

  const renderItem = useCallback(
    ({ item }) => <ProductCard product={item} onPress={openProduct} />,
    [openProduct]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  const getItemLayout = useCallback(
    (_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }),
    []
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError && products.length === 0) {
    return <ErrorView message="Couldn't load products. Check your connection." onRetry={refetch} />;
  }

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null}
      ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
      contentContainerStyle={styles.list}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12, backgroundColor: '#f6f6f6', flexGrow: 1 },
  footer: { marginVertical: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#777' },
});