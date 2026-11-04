import { getFinalPrice } from "./price";

const toCents = (amount) => Math.round(amount * 100);

function toCartItem(product, quantity) {
  return {
    id: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    price: product.price,
    discountPercentage: product.discountPercentage ?? 0,
    stock: product.stock,
    quantity,
  };
}

export function addToCart(items, product, quantity = 1) {
  if (!product.stock || product.stock <= 0) return items;

  const existing = items.find((item) => item.id === product.id);

  if (!existing) {
    return [...items, toCartItem(product, Math.min(quantity, product.stock))];
  }

  const nextQuantity = Math.min(existing.quantity + quantity, product.stock);
  if (nextQuantity === existing.quantity) return items;

  return items.map((item) =>
    item.id === product.id
      ? { ...item, quantity: nextQuantity, stock: product.stock }
      : item,
  );
}

export function updateItemQuantity(items, id, quantity) {
  if (quantity <= 0) return removeFromCart(items, id);

  return items.map((item) =>
    item.id === id
      ? { ...item, quantity: Math.min(quantity, item.stock) }
      : item,
  );
}

export function removeFromCart(items, id) {
  return items.filter((item) => item.id !== id);
}

export function getCartTotals(items) {
  let itemCount = 0;
  let subtotalCents = 0;
  let totalCents = 0;

  for (const item of items) {
    const finalPrice = getFinalPrice(item.price, item.discountPercentage);
    itemCount += item.quantity;
    subtotalCents += toCents(item.price) * item.quantity;
    totalCents += toCents(finalPrice) * item.quantity;
  }

  return {
    itemCount,
    subtotal: subtotalCents / 100,
    discount: (subtotalCents - totalCents) / 100,
    total: totalCents / 100,
  };
}
