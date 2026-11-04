import { useCartStore } from "../store/cartStore";
import { handleCartChange } from "./cartReminder";

export function startCartReminderSync() {
  let unsubscribeCart = () => {};

  const subscribeToCart = () => {
    unsubscribeCart = useCartStore.subscribe((state, prevState) => {
      if (state.items !== prevState.items) {
        handleCartChange(prevState.items, state.items).catch((error) => {
          console.warn("Cart reminder failed", error);
        });
      }
    });
  };

  // Wait for the saved cart to load first, otherwise restoring it from storage
  // on app launch would look like a "new item added" and trigger a reminder.
  if (useCartStore.persist.hasHydrated()) {
    subscribeToCart();
    return () => unsubscribeCart();
  }

  const unsubscribeHydration =
    useCartStore.persist.onFinishHydration(subscribeToCart);

  return () => {
    unsubscribeHydration();
    unsubscribeCart();
  };
}
