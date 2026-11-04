import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { SORT_OPTIONS, PRICE_RANGES, RATING_OPTIONS, DEFAULT_FILTERS } from '../constants/filters';

function OptionGroup({ title, options, selected, onSelect }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const active = option.key === selected;
          return (
            <Pressable
              key={String(option.key)}
              onPress={() => onSelect(option.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function FilterModal({ visible, value, onApply, onClose }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const update = (field, newValue) => setDraft((prev) => ({ ...prev, [field]: newValue }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <OptionGroup
            title="Sort by"
            options={SORT_OPTIONS}
            selected={draft.sortKey}
            onSelect={(key) => update('sortKey', key)}
          />
          <OptionGroup
            title="Price"
            options={PRICE_RANGES}
            selected={draft.priceKey}
            onSelect={(key) => update('priceKey', key)}
          />
          <OptionGroup
            title="Rating"
            options={RATING_OPTIONS}
            selected={draft.minRating}
            onSelect={(key) => update('minRating', key)}
          />

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.reset]} onPress={() => setDraft(DEFAULT_FILTERS)}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.apply]} onPress={() => onApply(draft)}>
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
  },
  group: { marginBottom: 18 },
  groupTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, color: '#111' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 13, color: '#333' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  reset: { borderWidth: 1, borderColor: '#111' },
  resetText: { fontWeight: '600', color: '#111' },
  apply: { backgroundColor: '#111' },
  applyText: { fontWeight: '600', color: '#fff' },
});