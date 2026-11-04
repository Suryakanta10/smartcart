import { getFinalPrice } from "./price";
import { getCartTotals } from "./cart";

export function generateOrderId(now = Date.now()) {
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `SC${String(now).slice(-6)}${random}`;
}

export function createOrder({
  items,
  address,
  paymentMethod,
  now = Date.now(),
}) {
  return {
    id: generateOrderId(now),
    createdAt: new Date(now).toISOString(),
    status: "confirmed",
    paymentMethod,
    address,
    totals: getCartTotals(items),
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      quantity: item.quantity,
      unitPrice: getFinalPrice(item.price, item.discountPercentage),
    })),
  };
}
