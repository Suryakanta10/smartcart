import { View, Text } from 'react-native';
import { useProducts } from '../src/hooks/useProducts';

export default function HomeScreen() {
  const { data, isLoading, isError } = useProducts();

  if (isLoading) return <Text>Loading...</Text>;
  if (isError) return <Text>Something went wrong</Text>;

  const count = data.pages.flatMap((page) => page.products).length;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loaded {count} products</Text>
    </View>
  );
}