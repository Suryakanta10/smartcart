export const SORT_OPTIONS = [
  { key: "default", label: "Default" },
  {
    key: "price-asc",
    label: "Price: Low to High",
    sortBy: "price",
    order: "asc",
  },
  {
    key: "price-desc",
    label: "Price: High to Low",
    sortBy: "price",
    order: "desc",
  },
  { key: "rating-desc", label: "Top Rated", sortBy: "rating", order: "desc" },
  { key: "title-asc", label: "Name: A to Z", sortBy: "title", order: "asc" },
];

export const PRICE_RANGES = [
  { key: "any", label: "Any" },
  { key: "under-20", label: "Under $20", max: 20 },
  { key: "20-100", label: "$20 – $100", min: 20, max: 100 },
  { key: "over-100", label: "Over $100", min: 100 },
];

export const RATING_OPTIONS = [
  { key: 0, label: "Any" },
  { key: 3, label: "3★ & up" },
  { key: 4, label: "4★ & up" },
];

export const DEFAULT_FILTERS = {
  sortKey: "default",
  priceKey: "any",
  minRating: 0,
};
