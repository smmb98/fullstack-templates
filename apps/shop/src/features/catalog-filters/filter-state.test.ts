import { describe, expect, it } from "vitest";
import {
  activeChips,
  activeFilterCount,
  emptyFilters,
  filterParams,
  priceRangeError,
  readCatalogFilters,
  removeChip,
  toggleValue,
  type CatalogFilters,
} from "./filter-state";

describe("readCatalogFilters", () => {
  it("returns empty filters for an empty URL", () => {
    expect(readCatalogFilters({})).toEqual(emptyFilters);
  });

  it("reads csv groups and the boolean flags", () => {
    const filters = readCatalogFilters({
      category: "Decor",
      brand: "Clay & Co,Northline",
      color: "Chalk",
      material: "Ceramic,Linen",
      minPrice: "10000",
      maxPrice: "20000",
      minRating: "4",
      inStock: "true",
      onSale: "false",
    });
    expect(filters).toEqual({
      category: "Decor",
      brands: ["Clay & Co", "Northline"],
      colors: ["Chalk"],
      materials: ["Ceramic", "Linen"],
      minPrice: 10000,
      maxPrice: 20000,
      minRating: 4,
      inStock: true,
      onSale: false,
    });
  });

  it("ignores invalid numbers and out-of-range ratings", () => {
    const filters = readCatalogFilters({
      minPrice: "-5",
      maxPrice: "abc",
      minRating: "9",
      inStock: "yes",
    });
    expect(filters.minPrice).toBeUndefined();
    expect(filters.maxPrice).toBeUndefined();
    expect(filters.minRating).toBeUndefined();
    expect(filters.inStock).toBe(false);
  });

  it("takes the first value when Next passes an array", () => {
    expect(readCatalogFilters({ category: ["Decor", "Lighting"] }).category).toBe("Decor");
  });
});

describe("filterParams", () => {
  it("omits empty values and joins csv groups", () => {
    const params = filterParams({
      ...emptyFilters,
      brands: ["Clay & Co", "Northline"],
      inStock: true,
    });
    expect(params.toString()).toBe("brand=Clay+%26+Co%2CNorthline&inStock=true");
  });

  it("round-trips through the reader", () => {
    const filters: CatalogFilters = {
      category: "Furniture",
      brands: ["Northline"],
      colors: ["Chalk"],
      materials: ["Oak"],
      minPrice: 5000,
      maxPrice: 30000,
      minRating: 3,
      inStock: true,
      onSale: true,
    };
    const params = Object.fromEntries(filterParams(filters).entries());
    expect(readCatalogFilters(params)).toEqual(filters);
  });
});

describe("activeFilterCount", () => {
  it("counts one per removable chip (each selected value + each range/flag)", () => {
    expect(activeFilterCount(emptyFilters)).toBe(0);
    expect(
      activeFilterCount({ ...emptyFilters, brands: ["a", "b"], minPrice: 1, maxPrice: 2 }),
    ).toBe(3);
    expect(
      activeFilterCount({
        category: "Decor",
        brands: ["a"],
        colors: ["b"],
        materials: ["c"],
        minRating: 4,
        inStock: true,
        onSale: true,
      }),
    ).toBe(7);
  });
});

describe("activeChips", () => {
  it("builds one chip per applied value plus ranges", () => {
    const chips = activeChips({
      ...emptyFilters,
      brands: ["Northline", "Clay & Co"],
      minPrice: 10000,
      maxPrice: 20000,
      inStock: true,
    });
    expect(chips.map((chip) => chip.kind)).toEqual([
      "brand",
      "brand",
      "price",
      "inStock",
    ]);
    expect(chips[2].label).toBe("$100.00 – $200.00");
  });
});

describe("removeChip", () => {
  const applied: CatalogFilters = {
    category: "Decor",
    brands: ["Northline", "Clay & Co"],
    colors: ["Chalk"],
    materials: [],
    minPrice: 1000,
    maxPrice: 2000,
    minRating: 4,
    inStock: true,
    onSale: true,
  };

  it("removes a single value from a group and keeps the rest", () => {
    const next = removeChip(applied, { kind: "brand", value: "Northline", label: "Northline" });
    expect(next.brands).toEqual(["Clay & Co"]);
    expect(next.category).toBe("Decor");
  });

  it("clears the whole price range with one chip", () => {
    const next = removeChip(applied, { kind: "price", label: "range" });
    expect(next.minPrice).toBeUndefined();
    expect(next.maxPrice).toBeUndefined();
  });

  it("turns off the boolean filters", () => {
    const next = removeChip(applied, { kind: "onSale", label: "On sale" });
    expect(next.onSale).toBe(false);
    expect(next.inStock).toBe(true);
  });
});

describe("priceRangeError", () => {
  it("accepts a valid or open range", () => {
    expect(priceRangeError(undefined, undefined)).toBeUndefined();
    expect(priceRangeError(100, undefined)).toBeUndefined();
    expect(priceRangeError(100, 100)).toBeUndefined();
  });

  it("rejects a minimum above the maximum", () => {
    expect(priceRangeError(300, 100)).toBe("Minimum price must be below the maximum.");
  });
});

describe("toggleValue", () => {
  it("adds then removes a value", () => {
    expect(toggleValue([], "Oak")).toEqual(["Oak"]);
    expect(toggleValue(["Oak", "Linen"], "Oak")).toEqual(["Linen"]);
  });
});
