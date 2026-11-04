import { request, toQuery } from "./client";

export const PAGE_SIZE = 20;

const LIST_FIELDS =
  "id,title,price,discountPercentage,rating,stock,thumbnail,category,brand,tags,availabilityStatus";

export function fetchProductPage({
  skip = 0,
  query,
  category,
  sortBy,
  order,
  signal,
} = {}) {
  let path = "/products";
  if (query) {
    path = "/products/search";
  } else if (category) {
    path = `/products/category/${encodeURIComponent(category)}`;
  }

  const qs = toQuery({
    q: query || undefined,
    limit: PAGE_SIZE,
    skip,
    select: LIST_FIELDS,
    sortBy,
    order,
  });

  return request(`${path}?${qs}`, signal);
}

export function fetchCategories(signal) {
  return request("/products/categories", signal);
}
