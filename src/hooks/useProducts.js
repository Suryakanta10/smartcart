import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts } from "../api/products";

export function useProducts(sort = {}) {
  return useInfiniteQuery({
    queryKey: ["products", sort],
    queryFn: ({ pageParam, signal }) =>
      getProducts({
        skip: pageParam,
        sortBy: sort.sortBy,
        order: sort.order,
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
  });
}
