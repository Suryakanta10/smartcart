import { memo, useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';

function ImageGallery({ images = [] }) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const height = width * 0.85;

  const onScrollEnd = useCallback(
    (event) => setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width)),
    [width]
  );

  if (images.length === 0) {
    return <View style={[styles.placeholder, { width, height }]} />;
  }

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        scrollEnabled={images.length > 1}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(uri, index) => `${index}-${uri}`}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <Image
            source={item}
            style={{ width, height, backgroundColor: '#f3f3f3' }}
            contentFit="contain"
            transition={150}
            cachePolicy="memory-disk"
          />
        )}
      />

      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((uri, index) => (
            <View key={uri} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

export default memo(ImageGallery);

const styles = StyleSheet.create({
  placeholder: { backgroundColor: '#f3f3f3' },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ccc' },
  dotActive: { backgroundColor: '#111', width: 18 },
});