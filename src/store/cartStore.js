import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addToCart, updateItemQuantity, removeFromCart } from "../utils/cart";

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => ({ items: addToCart(state.items, product, quantity) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: updateItemQuantity(state.items, id, quantity),
        })),

      removeItem: (id) =>
        set((state) => ({ items: removeFromCart(state.items, id) })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "smartcart-cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const useCartCount = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
