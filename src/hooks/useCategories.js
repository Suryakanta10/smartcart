import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/products";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: Infinity,
  });
}
