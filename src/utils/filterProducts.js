import { getFinalPrice } from "./price";

export function filterProducts(
  products,
  { category, priceRange, minRating } = {},
) {
  return products.filter((product) => {
    if (category && product.category !== category) return false;

    const finalPrice = getFinalPrice(product.price, product.discountPercentage);
    if (priceRange?.min != null && finalPrice < priceRange.min) return false;
    if (priceRange?.max != null && finalPrice > priceRange.max) return false;

    if (minRating && product.rating < minRating) return false;

    return true;
  });
}
