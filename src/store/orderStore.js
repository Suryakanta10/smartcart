import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useOrderStore = create(
  persist(
    (set) => ({
      orders: [],
      savedAddress: null,

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
          savedAddress: order.address,
        })),
    }),
    {
      name: "smartcart-orders",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        orders: state.orders,
        savedAddress: state.savedAddress,
      }),
    },
  ),
);
