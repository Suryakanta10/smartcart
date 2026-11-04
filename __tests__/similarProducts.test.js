import { getSimilarProducts } from "../src/utils/similarProducts";

const base = {
  id: 1,
  category: "smartphones",
  brand: "Apple",
  tags: ["smartphones", "apple"],
  price: 1000,
  rating: 4,
};

const sameBrandClosePrice = {
  id: 2,
  category: "smartphones",
  brand: "Apple",
  tags: ["smartphones", "apple"],
  price: 950,
  rating: 4.1,
};
const otherBrandClosePrice = {
  id: 3,
  category: "smartphones",
  brand: "Samsung",
  tags: ["smartphones"],
  price: 1100,
  rating: 4.9,
};
const otherBrandCheap = {
  id: 4,
  category: "smartphones",
  brand: "Oppo",
  tags: ["smartphones"],
  price: 300,
  rating: 5,
};

describe("getSimilarProducts", () => {
  it("never includes the product itself", () => {
    const result = getSimilarProducts(base, [base, sameBrandClosePrice]);
    expect(result.map((p) => p.id)).not.toContain(1);
  });

  it("ranks by brand, tags and price closeness", () => {
    const result = getSimilarProducts(base, [
      otherBrandCheap,
      otherBrandClosePrice,
      sameBrandClosePrice,
    ]);
    expect(result.map((p) => p.id)).toEqual([2, 3, 4]);
  });

  it("uses rating to break ties", () => {
    const a = {
      id: 5,
      category: "smartphones",
      brand: "X",
      tags: [],
      price: 1000,
      rating: 3,
    };
    const b = {
      id: 6,
      category: "smartphones",
      brand: "Y",
      tags: [],
      price: 1000,
      rating: 4.5,
    };
    const result = getSimilarProducts(base, [a, b]);
    expect(result.map((p) => p.id)).toEqual([6, 5]);
  });

  it("respects the limit", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      ...otherBrandCheap,
      id: 100 + i,
    }));
    expect(getSimilarProducts(base, many, 4)).toHaveLength(4);
  });

  it("returns an empty list when there is no product", () => {
    expect(getSimilarProducts(undefined, [sameBrandClosePrice])).toEqual([]);
  });
});
