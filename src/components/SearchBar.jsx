import { memo } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';

function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search products"
        placeholderTextColor="#999"
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={10}>
          <Text style={styles.clear}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

export default memo(SearchBar);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  input: { flex: 1, height: 44, fontSize: 15, color: '#111' },
  clear: { fontSize: 16, color: '#888', paddingLeft: 8 },
});