import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchProductPage } from "../api/products";

export function useProducts({
  query = "",
  category = null,
  sortBy,
  order,
} = {}) {
  return useInfiniteQuery({
    queryKey: ["products", { query, category, sortBy, order }],
    queryFn: ({ pageParam, signal }) =>
      fetchProductPage({
        skip: pageParam,
        query,
        category,
        sortBy,
        order,
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
    placeholderData: keepPreviousData,
  });
}
