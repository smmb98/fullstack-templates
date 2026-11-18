import type { ProductDetail } from "@fullstack-templates/api-contract";
import { productDetailFor, products } from "@fullstack-templates/mocks";
import { describe, expect, it } from "vitest";
import {
  addCartItem,
  CART_STORAGE_KEY,
  cartQuantity,
  cartTotal,
  MAX_ITEM_QUANTITY,
  readCart,
  writeCart,
  type CartItem,
} from "./cart";
import {
  availabilityLabel,
  clampQuantity,
  discountPercent,
  findVariant,
  firstAvailableVariant,
  optionAvailability,
  pickOption,
  productJsonLd,
  selectionOf,
  serializeJsonLd,
  stockNote,
  variantLabel,
} from "./detail";

const oak = productDetailFor(products[10]);
const bowl = productDetailFor(products[2]);
const alder = productDetailFor(products[0]);

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    slug: "stoneware-serving-bowl",
    variantId: "speckled-cream--small",
    title: "Stoneware Serving Bowl",
    color: "Speckled cream",
    size: "Small",
    unitAmount: 5400,
    currency: "USD",
    quantity: 1,
    ...overrides,
  };
}

function memoryStorage(seed: Record<string, string> = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    dump: () => Object.fromEntries(data.entries()),
  };
}

describe("variants", () => {
  it("labels a variant by colour and size, hiding the synthetic size", () => {
    expect(variantLabel({ color: "Natural oak", size: "180 cm" })).toBe("Natural oak · 180 cm");
    expect(variantLabel({ color: "Brass", size: "One size" })).toBe("Brass");
  });

  it("splits stock across combinations and never invents availability", () => {
    expect(oak.variants).toHaveLength(4);
    expect(oak.variants.every((variant) => variant.stock === 0 && !variant.inStock)).toBe(true);
    expect(bowl.variants.map((variant) => variant.stock)).toEqual([12, 12]);
    expect(alder.variants.map((variant) => variant.inStock)).toEqual([true, true]);
    expect(alder.variants[0].id).toBe("natural-oak--one-size");
  });

  it("starts on the first in-stock variant", () => {
    expect(firstAvailableVariant(oak.variants)).toMatchObject({ size: "180 cm", inStock: false });
    expect(firstAvailableVariant(bowl.variants)).toMatchObject({ size: "Small", inStock: true });
    expect(firstAvailableVariant([])).toBeNull();
  });

  it("prefers an in-stock neighbour when the exact combination is unavailable", () => {
    const selection = selectionOf(bowl.variants[0]);
    expect(pickOption(bowl.variants, selection, "size", "Large")).toEqual({
      color: "Speckled cream",
      size: "Large",
    });
    expect(findVariant(bowl.variants, selection)).toMatchObject({ id: "speckled-cream--small" });
  });

  it("marks an option unavailable only when no in-stock combination is left", () => {
    const mixed: ProductDetail = {
      ...bowl,
      variants: [
        { id: "a", color: "Chalk", size: "Small", inStock: true, stock: 2 },
        { id: "b", color: "Chalk", size: "Large", inStock: false, stock: 0 },
        { id: "c", color: "Slate", size: "Small", inStock: false, stock: 0 },
        { id: "d", color: "Slate", size: "Large", inStock: false, stock: 0 },
      ],
    };
    expect(optionAvailability(mixed.variants, { color: "Chalk", size: "Small" }, "color")).toEqual([
      { value: "Chalk", available: true },
      { value: "Slate", available: false },
    ]);
    expect(optionAvailability(mixed.variants, { color: "Chalk", size: "Small" }, "size")).toEqual([
      { value: "Small", available: true },
      { value: "Large", available: false },
    ]);
  });
});

describe("buying rules", () => {
  it("clamps quantity to the variant stock and the demo ceiling", () => {
    expect(clampQuantity(0, 5)).toBe(1);
    expect(clampQuantity(3.7, 5)).toBe(3);
    expect(clampQuantity(99, 5)).toBe(5);
    expect(clampQuantity(99, 40)).toBe(MAX_ITEM_QUANTITY);
    expect(clampQuantity(Number.NaN, 5)).toBe(1);
  });

  it("reads availability and delivery notes from stock", () => {
    expect(availabilityLabel(oak)).toBe("Out of stock");
    expect(availabilityLabel({ inStock: true, stock: 1 })).toBe("Only 1 left");
    expect(availabilityLabel({ inStock: true, stock: 3 })).toBe("Only 3 left");
    expect(availabilityLabel({ inStock: true, stock: 9 })).toBe("In stock");
    expect(stockNote({ inStock: false, leadTime: "Made to order · ships in 6–8 weeks" })).toBe(
      "Made to order · ships in 6–8 weeks",
    );
    expect(stockNote({ inStock: true, leadTime: null })).toBeNull();
  });

  it("computes the sale percentage only for a real reduction", () => {
    expect(discountPercent(11900, 14900)).toBe(20);
    expect(discountPercent(100, null)).toBeNull();
    expect(discountPercent(100, 100)).toBeNull();
  });
});

describe("structured data", () => {
  it("describes the product and its offer", () => {
    const jsonLd = productJsonLd(bowl, "/products/stoneware-serving-bowl");
    expect(jsonLd).toMatchObject({
      "@type": "Product",
      name: "Stoneware Serving Bowl",
      sku: "p-003",
      brand: { "@type": "Brand", name: "Clay & Co" },
      aggregateRating: { ratingValue: 4.8, reviewCount: 63 },
      offers: {
        price: "54.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    });
    expect(productJsonLd(oak, "/products/oak-dining-table").offers.availability).toBe(
      "https://schema.org/OutOfStock",
    );
    expect(
      productJsonLd({ ...bowl, reviewCount: 0 }, "/products/x").aggregateRating,
    ).toBeUndefined();
  });

  it("escapes angle brackets so a title cannot break the script", () => {
    expect(serializeJsonLd({ name: "</script><b>" })).not.toContain("</script>");
    expect(serializeJsonLd({ name: "</script>" })).toContain("\\u003c/script>");
  });
});

describe("cart storage", () => {
  it("merges the same variant and keeps separate variants apart", () => {
    const once = addCartItem([], item());
    const twice = addCartItem(once, item({ quantity: 2 }));
    expect(twice).toHaveLength(1);
    expect(twice[0].quantity).toBe(3);

    const other = addCartItem(twice, item({ variantId: "speckled-cream--large", size: "Large" }));
    expect(other).toHaveLength(2);
    expect(cartQuantity(other)).toBe(4);
    expect(cartTotal(other)).toEqual({ amount: 5400 * 4, currency: "USD" });
  });

  it("caps a single line at the demo ceiling", () => {
    const full = addCartItem([], item({ quantity: 8 }));
    expect(addCartItem(full, item({ quantity: 8 }))[0].quantity).toBe(MAX_ITEM_QUANTITY);
  });

  it("round-trips and tolerates missing, invalid or partial entries", () => {
    const storage = memoryStorage();
    writeCart(storage, [item({ quantity: 2 })]);
    expect(readCart(storage)).toHaveLength(1);
    expect(readCart(storage)[0].quantity).toBe(2);
    expect(JSON.parse(storage.dump()[CART_STORAGE_KEY])).toHaveLength(1);

    expect(readCart(undefined)).toEqual([]);
    expect(readCart(memoryStorage())).toEqual([]);
    expect(readCart(memoryStorage({ [CART_STORAGE_KEY]: "not json" }))).toEqual([]);
    expect(
      readCart(memoryStorage({ [CART_STORAGE_KEY]: '[{"slug":"x"},{"slug":"y","quantity":3}]' })),
    ).toEqual([]);
  });

  it("clamps stored quantities on read", () => {
    const storage = memoryStorage({
      [CART_STORAGE_KEY]: JSON.stringify([{ ...item(), quantity: 500 }]),
    });
    expect(readCart(storage)[0].quantity).toBe(MAX_ITEM_QUANTITY);
  });
});
