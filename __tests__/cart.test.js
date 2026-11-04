import {
  addToCart,
  updateItemQuantity,
  removeFromCart,
  getCartTotals,
} from "../src/utils/cart";

const phone = {
  id: 1,
  title: "Phone",
  thumbnail: "p.png",
  price: 100,
  discountPercentage: 10,
  stock: 5,
};
const cover = {
  id: 2,
  title: "Cover",
  thumbnail: "c.png",
  price: 9.99,
  discountPercentage: 0,
  stock: 2,
};

describe("addToCart", () => {
  it("adds a new product with quantity 1", () => {
    const items = addToCart([], phone);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: 1, quantity: 1 });
  });

  it("increases quantity when the product is already in the cart", () => {
    const items = addToCart(addToCart([], phone), phone);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("never goes above available stock", () => {
    const items = addToCart([], cover, 10);
    expect(items[0].quantity).toBe(2);
  });

  it("returns the same array when nothing changes", () => {
    const full = addToCart([], cover, 2);
    expect(addToCart(full, cover)).toBe(full);
  });

  it("ignores out of stock products", () => {
    const items = addToCart([], { ...phone, stock: 0 });
    expect(items).toEqual([]);
  });
});

describe("updateItemQuantity", () => {
  it("removes the item when quantity drops to 0", () => {
    const items = addToCart([], phone);
    expect(updateItemQuantity(items, 1, 0)).toEqual([]);
  });

  it("clamps quantity to stock", () => {
    const items = addToCart([], phone);
    expect(updateItemQuantity(items, 1, 99)[0].quantity).toBe(5);
  });
});

describe("removeFromCart", () => {
  it("removes only the matching item", () => {
    const items = addToCart(addToCart([], phone), cover);
    const result = removeFromCart(items, 1);
    expect(result.map((item) => item.id)).toEqual([2]);
  });
});

describe("getCartTotals", () => {
  it("returns zeros for an empty cart", () => {
    expect(getCartTotals([])).toEqual({
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      total: 0,
    });
  });

  it("calculates subtotal, discount and total", () => {
    let items = addToCart([], phone, 2); // 2 x 100, 10% off -> 180
    items = addToCart(items, cover); // 1 x 9.99, no discount
    expect(getCartTotals(items)).toEqual({
      itemCount: 3,
      subtotal: 209.99,
      discount: 20,
      total: 189.99,
    });
  });

  it("avoids floating point errors", () => {
    const cheap = {
      id: 3,
      title: "Sticker",
      thumbnail: "s.png",
      price: 0.1,
      discountPercentage: 0,
      stock: 10,
    };
    const items = addToCart([], cheap, 3);
    expect(getCartTotals(items).total).toBe(0.3); // plain JS would give 0.30000000000000004
  });
});
