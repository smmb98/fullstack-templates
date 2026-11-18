import { describe, expect, it } from "vitest";
import {
  MAX_RECENT_SEARCHES,
  moveActiveIndex,
  normalizeQuery,
  readRecentSearches,
  RECENT_SEARCHES_KEY,
  rememberSearch,
  suggestionHref,
  typeLabel,
  writeRecentSearches,
} from "./search";

function memoryStorage(seed: Record<string, string> = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    dump: () => Object.fromEntries(data.entries()),
  };
}

describe("normalizeQuery", () => {
  it("collapses whitespace, trims and caps the length", () => {
    expect(normalizeQuery("  oak   table ")).toBe("oak table");
    expect(normalizeQuery("x".repeat(120))).toHaveLength(80);
    expect(normalizeQuery("   ")).toBe("");
  });
});

describe("rememberSearch", () => {
  it("puts the newest first and de-duplicates case-insensitively", () => {
    expect(rememberSearch(["linen", "brass"], "Oak")).toEqual(["Oak", "linen", "brass"]);
    expect(rememberSearch(["linen", "Oak"], "oak")).toEqual(["oak", "linen"]);
  });

  it("caps the list and ignores blank queries", () => {
    const full = ["a", "b", "c", "d", "e"];
    expect(rememberSearch(full, "f")).toEqual(["f", "a", "b", "c", "d"]);
    expect(rememberSearch(full, "   ")).toEqual(full);
    expect(MAX_RECENT_SEARCHES).toBe(5);
  });
});

describe("recent search storage", () => {
  it("round-trips through storage and tolerates junk", () => {
    const storage = memoryStorage();
    writeRecentSearches(storage, ["oak", "linen"]);
    expect(JSON.parse(storage.dump()[RECENT_SEARCHES_KEY])).toEqual(["oak", "linen"]);
    expect(readRecentSearches(storage)).toEqual(["oak", "linen"]);
  });

  it("returns an empty list for missing, invalid or non-string entries", () => {
    expect(readRecentSearches(undefined)).toEqual([]);
    expect(readRecentSearches(memoryStorage())).toEqual([]);
    expect(readRecentSearches(memoryStorage({ [RECENT_SEARCHES_KEY]: "not json" }))).toEqual([]);
    expect(readRecentSearches(memoryStorage({ [RECENT_SEARCHES_KEY]: '["oak",42,null]' }))).toEqual([
      "oak",
    ]);
  });
});

describe("suggestionHref", () => {
  it("keeps suggestions inside the catalog URL contract", () => {
    expect(
      suggestionHref({ type: "category", value: "Kitchen and Dining", label: "Kitchen and Dining" }),
    ).toBe("/products?category=Kitchen%20and%20Dining");
    expect(suggestionHref({ type: "brand", value: "Clay & Co", label: "Clay & Co" })).toBe(
      "/products?brand=Clay%20%26%20Co",
    );
    expect(
      suggestionHref({ type: "product", value: "oak-dining-table", label: "Oak Dining Table" }),
    ).toBe("/products?q=Oak%20Dining%20Table");
  });
});

describe("moveActiveIndex", () => {
  it("starts at the right edge and wraps both ways", () => {
    expect(moveActiveIndex(-1, 1, 3)).toBe(0);
    expect(moveActiveIndex(-1, -1, 3)).toBe(2);
    expect(moveActiveIndex(2, 1, 3)).toBe(0);
    expect(moveActiveIndex(0, -1, 3)).toBe(2);
    expect(moveActiveIndex(0, 1, 0)).toBe(-1);
  });
});

describe("typeLabel", () => {
  it("labels every suggestion kind", () => {
    expect(typeLabel("product")).toBe("Product");
    expect(typeLabel("category")).toBe("Category");
    expect(typeLabel("brand")).toBe("Brand");
  });
});
