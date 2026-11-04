import { renderHook, act } from "@testing-library/react-native";
import { useDebounce } from "../src/hooks/useDebounce";
import { fetchProductPage } from "../src/api/products";
import { ApiError } from "../src/api/client";
import { filterProducts } from "../src/utils/filterProducts";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("only updates after the user stops typing", async () => {
    const { result, rerender } = await renderHook(
      ({ value }) => useDebounce(value, 400),
      {
        initialProps: { value: "" },
      },
    );

    await rerender({ value: "p" });
    await rerender({ value: "ph" });
    await rerender({ value: "phone" });
    expect(result.current).toBe("");

    await act(async () => {
      jest.advanceTimersByTime(399);
    });
    expect(result.current).toBe("");

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("phone");
  });

  it("restarts the timer on every keystroke", async () => {
    const { result, rerender } = await renderHook(
      ({ value }) => useDebounce(value, 400),
      {
        initialProps: { value: "" },
      },
    );

    await rerender({ value: "lap" });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await rerender({ value: "laptop" });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe(""); // 600ms passed, but only 300ms since the last change

    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe("laptop");
  });

  it("never emits the intermediate values", async () => {
    const seen = [];
    const { rerender } = await renderHook(
      ({ value }) => {
        const debounced = useDebounce(value, 400);
        seen.push(debounced);
        return debounced;
      },
      { initialProps: { value: "" } },
    );

    for (const value of ["m", "ma", "mas", "masc", "mascara"]) {
      await rerender({ value });
    }

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(seen).not.toContain("mas");
    expect(seen[seen.length - 1]).toBe("mascara");
  });
});

describe("fetchProductPage", () => {
  const originalFetch = global.fetch;
  const emptyPage = { products: [], total: 0, skip: 0, limit: 20 };

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(emptyPage),
      }),
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const calledUrl = () => global.fetch.mock.calls[0][0];

  it("uses the search endpoint and encodes the query", async () => {
    await fetchProductPage({ query: "red phone" });
    expect(calledUrl()).toContain("/products/search?q=red%20phone");
  });

  it("prefers search over category because the API cannot combine them", async () => {
    await fetchProductPage({ query: "mascara", category: "beauty" });
    expect(calledUrl()).toContain("/products/search");
    expect(calledUrl()).not.toContain("/category/");
  });

  it("uses the category endpoint when there is no search text", async () => {
    await fetchProductPage({ category: "smartphones" });
    expect(calledUrl()).toContain("/products/category/smartphones");
  });

  it("passes sorting and pagination params", async () => {
    await fetchProductPage({ skip: 40, sortBy: "price", order: "asc" });
    const url = calledUrl();
    expect(url).toContain("skip=40");
    expect(url).toContain("sortBy=price");
    expect(url).toContain("order=asc");
  });

  it("throws an ApiError with the status code when the request fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    await expect(fetchProductPage({ query: "phone" })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});

describe("filterProducts", () => {
  const products = [
    {
      id: 1,
      category: "beauty",
      price: 10,
      discountPercentage: 0,
      rating: 4.5,
    },
    {
      id: 2,
      category: "beauty",
      price: 120,
      discountPercentage: 50,
      rating: 3.2,
    }, // final price 60
    {
      id: 3,
      category: "laptops",
      price: 900,
      discountPercentage: 10,
      rating: 4.8,
    },
  ];

  const ids = (list) => list.map((p) => p.id);

  it("returns everything when no filters are set", () => {
    expect(ids(filterProducts(products))).toEqual([1, 2, 3]);
  });

  it("filters by category", () => {
    expect(ids(filterProducts(products, { category: "beauty" }))).toEqual([
      1, 2,
    ]);
  });

  it("filters by the discounted price, not the original price", () => {
    const result = filterProducts(products, {
      priceRange: { min: 20, max: 100 },
    });
    expect(ids(result)).toEqual([2]); // 120 with 50% off = 60
  });

  it("filters by minimum rating", () => {
    expect(ids(filterProducts(products, { minRating: 4 }))).toEqual([1, 3]);
  });
});
