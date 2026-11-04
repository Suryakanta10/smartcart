export function getFinalPrice(price, discountPercentage = 0) {
  const discounted = price * (1 - discountPercentage / 100);
  return Math.round(discounted * 100) / 100;
}

export function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}
