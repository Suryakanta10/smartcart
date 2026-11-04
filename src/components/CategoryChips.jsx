import { memo, useMemo } from 'react';
import { FlatList, Pressable, Text, StyleSheet } from 'react-native';

function CategoryChips({ categories = [], selected, onSelect }) {
  const data = useMemo(() => [{ slug: null, name: 'All' }, ...categories], [categories]);

  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item) => item.slug ?? 'all'}
      showsHorizontalScrollIndicator={false}
      style={styles.list}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => {
        const active = item.slug === selected;
        return (
          <Pressable
            onPress={() => onSelect(item.slug)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{item.name}</Text>
          </Pressable>
        );
      }}
    />
  );
}

export default memo(CategoryChips);

const styles = StyleSheet.create({
  list: { flexGrow: 0, flexShrink: 0 },
  container: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  text: { fontSize: 13, color: '#333' },
  textActive: { color: '#fff', fontWeight: '600' },
});