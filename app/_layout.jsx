import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HeaderActions from '../src/components/HeaderActions';
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
      <Stack screenOptions={{ headerRight: () => <HeaderActions /> }}>
        <Stack.Screen name="index" options={{ title: 'SmartCart' }} />
        <Stack.Screen name="product/[id]" options={{ title: '' }} />
        <Stack.Screen name="cart" options={{ title: 'My Cart', headerRight: () => null }} />
        <Stack.Screen name="wishlist" options={{ title: 'Wishlist', headerRight: () => <CartButton /> }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout', headerRight: () => null }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Order', headerRight: () => null }} />
        <Stack.Screen name="orders" options={{ title: 'My Orders', headerRight: () => <CartButton /> }} />
      </Stack>
    </QueryClientProvider>
  );
}