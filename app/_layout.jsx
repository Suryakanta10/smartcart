import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CartButton from '../src/components/CartButton';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
   <Stack screenOptions={{ headerRight: () => <CartButton /> }}>
  <Stack.Screen name="index" options={{ title: 'SmartCart' }} />
  <Stack.Screen name="product/[id]" options={{ title: '' }} />
  <Stack.Screen name="cart" options={{ title: 'Cart', headerRight: () => null }} />
</Stack>
    </QueryClientProvider>
  );
}