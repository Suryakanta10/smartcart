import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { queryClient, persistOptions } from '../src/api/queryClient';
import HeaderActions from '../src/components/HeaderActions';
import CartButton from '../src/components/CartButton';
import { configureNotifications } from '../src/services/notifications';
import { startCartReminderSync } from '../src/services/cartReminderSync';
import { useNotificationObserver } from '../src/hooks/useNotificationObserver';

configureNotifications();

export default function RootLayout() {
  useNotificationObserver();

  useEffect(() => {
    const stopSync = startCartReminderSync();
    return stopSync;
  }, []);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <Stack screenOptions={{ headerRight: () => <HeaderActions /> }}>
        <Stack.Screen name="index" options={{ title: 'SmartCart' }} />
        <Stack.Screen name="product/[id]" options={{ title: '' }} />
        <Stack.Screen name="cart" options={{ title: 'My Cart', headerRight: () => null }} />
        <Stack.Screen name="wishlist" options={{ title: 'Wishlist', headerRight: () => <CartButton /> }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout', headerRight: () => null }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Order', headerRight: () => null }} />
        <Stack.Screen name="orders" options={{ title: 'My Orders', headerRight: () => <CartButton /> }} />
      </Stack>
    </PersistQueryClientProvider>
  );
}