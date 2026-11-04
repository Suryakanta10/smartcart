import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProductsByCategory } from "../api/products";
import { getSimilarProducts } from "../utils/similarProducts";

export function useSimilarProducts(product, limit = 6) {
  const category = product?.category;

  const query = useQuery({
    queryKey: ["category-products", category],
    queryFn: ({ signal }) => fetchProductsByCategory(category, signal),
    enabled: Boolean(category),
    staleTime: 10 * 60 * 1000,
  });

  const similar = useMemo(
    () => getSimilarProducts(product, query.data?.products ?? [], limit),
    [product, query.data, limit],
  );

  return { ...query, data: similar };
}
