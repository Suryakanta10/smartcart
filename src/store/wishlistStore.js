import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

function toWishlistItem(product) {
  return {
    id: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    price: product.price,
    discountPercentage: product.discountPercentage ?? 0,
    rating: product.rating,
    stock: product.stock,
  };
}

export const useWishlistStore = create(
  persist(
    (set) => ({
      items: [],

      toggle: (product) =>
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          return {
            items: exists
              ? state.items.filter((item) => item.id !== product.id)
              : [...state.items, toWishlistItem(product)],
          };
        }),

      remove: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
    }),
    {
      name: "smartcart-wishlist",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const useIsWishlisted = (id) =>
  useWishlistStore((state) => state.items.some((item) => item.id === id));
