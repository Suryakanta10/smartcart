import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProducts } from '../src/hooks/useProducts';
import { useCategories } from '../src/hooks/useCategories';
import { useDebounce } from '../src/hooks/useDebounce';
import { useIsOffline } from '../src/hooks/useIsOffline';
import { filterProducts } from '../src/utils/filterProducts';
import { SORT_OPTIONS, PRICE_RANGES, DEFAULT_FILTERS } from '../src/constants/filters';

import ProductCard, { ITEM_HEIGHT } from '../src/components/ProductCard';
import ErrorView from '../src/components/ErrorView';
import SearchBar from '../src/components/SearchBar';
import CategoryChips from '../src/components/CategoryChips';
import FilterModal from '../src/components/FilterModal';
import OfflineBanner from '../src/components/OfflineBanner';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isOffline = useIsOffline();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 400);

  const sort = SORT_OPTIONS.find((o) => o.key === filters.sortKey);
  const priceRange = PRICE_RANGES.find((r) => r.key === filters.priceKey);

  const { data: categories } = useCategories();

  const {
    data,
    isPending,
    isError,
    isFetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts({
    query: debouncedSearch,
    category,
    sortBy: sort?.sortBy,
    order: sort?.order,
  });

  const allProducts = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data]
  );

  const products = useMemo(
    () => filterProducts(allProducts, { category, priceRange, minRating: filters.minRating }),
    [allProducts, category, priceRange, filters.minRating]
  );

  // Client-side filters can leave very few items on screen, which means
  // onEndReached may never fire. Keep loading pages until the screen is filled.
  useEffect(() => {
    if (products.length < 6 && hasNextPage && !isFetching && !isOffline) {
      fetchNextPage();
    }
  }, [products.length, hasNextPage, isFetching, isOffline, fetchNextPage]);

  const activeFilterCount =
    (filters.sortKey !== 'default') + (filters.priceKey !== 'any') + (filters.minRating > 0);

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
    if (hasNextPage && !isFetchingNextPage && !isOffline) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isOffline, fetchNextPage]);

  const onRefresh = useCallback(async () => {
    // A refetch while offline is paused until the network returns,
    // which would leave the spinner stuck. Skip it instead.
    if (isOffline) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, isOffline]);

  const applyFilters = useCallback((next) => {
    setFilters(next);
    setFilterOpen(false);
  }, []);

  const closeFilters = useCallback(() => setFilterOpen(false), []);

  let content;
  if (isPending && isOffline) {
    content = (
      <ErrorView
        message="You're offline and there are no saved products yet. Connect to the internet to start browsing."
        onRetry={refetch}
      />
    );
  } else if (isPending) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (isError && allProducts.length === 0) {
    content = <ErrorView message="Couldn't load products. Please try again." onRetry={refetch} />;
  } else {
    content = (
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null}
        ListEmptyComponent={
          !isFetching ? <Text style={styles.empty}>No products match your search</Text> : null
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    );
  }

  return (
    <View style={styles.screen}>
      <OfflineBanner />
      <SearchBar value={search} onChangeText={setSearch} />
      <CategoryChips categories={categories} selected={category} onSelect={setCategory} />

      <View style={styles.toolbar}>
        <View style={styles.countRow}>
          <Text style={styles.count}>{products.length} items</Text>
          {isFetching && !isFetchingNextPage && !refreshing && (
            <ActivityIndicator size="small" style={styles.inlineLoader} />
          )}
        </View>
        <Pressable onPress={() => setFilterOpen(true)} hitSlop={8}>
          <Text style={styles.filterButton}>
            Sort & Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </Pressable>
      </View>

      {content}

      <FilterModal
        visible={filterOpen}
        value={filters}
        onApply={applyFilters}
        onClose={closeFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f6f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  countRow: { flexDirection: 'row', alignItems: 'center' },
  count: { fontSize: 13, color: '#666' },
  inlineLoader: { marginLeft: 8 },
  filterButton: { fontSize: 14, fontWeight: '600', color: '#111' },
  list: { paddingHorizontal: 12, flexGrow: 1 },
  footer: { marginVertical: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#777' },
});