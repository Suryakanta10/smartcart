import { AppState, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  QueryClient,
  onlineManager,
  focusManager,
} from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const ONE_DAY = 24 * 60 * 60 * 1000;

// Tell React Query when the device goes offline/online.
// Offline queries get paused instead of failing, and resume automatically.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
);

// Refetch stale data when the app comes back to the foreground.
AppState.addEventListener("change", (status) => {
  if (Platform.OS !== "web") focusManager.setFocused(status === "active");
});

function shouldRetry(failureCount, error) {
  const status = error?.status;
  if (status >= 400 && status < 500) return false;
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: ONE_DAY,
      retry: shouldRetry,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "smartcart-query-cache",
});

export const persistOptions = {
  persister,
  maxAge: ONE_DAY,
  buster: "v1",
  dehydrateOptions: {
    // Save browsing data, but skip search results so storage stays small.
    shouldDehydrateQuery: (query) =>
      query.state.status === "success" && !query.queryKey[1]?.query,
  },
};
