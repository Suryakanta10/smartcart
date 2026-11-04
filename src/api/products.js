import { request, toQuery } from "./client";

export const PAGE_SIZE = 20;

const FIELDS =
  "id,title,description,price,discountPercentage,rating,stock,category,tags,thumbnail,images";

export function getProducts({ skip = 0, sortBy, order, signal } = {}) {
  const query = toQuery({
    limit: PAGE_SIZE,
    skip,
    select: FIELDS,
    sortBy,
    order,
  });
  return request(`/products?${query}`, signal);
}
