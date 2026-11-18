import { describe, expect, it } from "vitest";
import {
  ApiError,
  kindFromStatus,
  productListQuerySchema,
  productListResponseSchema,
  productSchema,
} from "./index";

const validProduct = {
  id: "p1",
  slug: "alder-chair",
  title: "Alder Chair",
  description: "Solid oak.",
  price: { amount: 24900, currency: "USD" },
  compareAtPrice: null,
  rating: 4.6,
  reviewCount: 12,
  brand: "Northline",
  category: "Furniture",
  categoryPath: ["Furniture", "Seating"],
  images: [{ src: "/images/p1.svg", alt: "Alder chair", width: 800, height: 600 }],
  inStock: true,
  stock: 4,
  colors: ["Oak"],
  materials: ["Oak"],
  sizes: [],
  createdAt: "2025-01-15T09:00:00.000Z",
};

describe("product schema", () => {
  it("accepts a valid product and rejects a negative stock", () => {
    expect(productSchema.parse(validProduct).slug).toBe("alder-chair");
    expect(() => productSchema.parse({ ...validProduct, stock: -1 })).toThrow();
  });

  it("applies query defaults and coerces page numbers", () => {
    expect(productListQuerySchema.parse({})).toMatchObject({ page: 1, pageSize: 12 });
    expect(productListQuerySchema.parse({ page: "3" }).page).toBe(3);
    expect(() => productListQuerySchema.parse({ pageSize: 500 })).toThrow();
  });

  it("accepts the list envelope with an optional partial flag", () => {
    const parsed = productListResponseSchema.parse({
      items: [validProduct],
      page: 1,
      pageSize: 12,
      total: 1,
      partial: true,
    });
    expect(parsed.items).toHaveLength(1);
    expect(parsed.partial).toBe(true);
  });
});

describe("ApiError", () => {
  it("maps statuses to kinds", () => {
    expect(kindFromStatus(401)).toBe("unauthorized");
    expect(kindFromStatus(429)).toBe("rate-limited");
    expect(kindFromStatus(503)).toBe("http");
  });

  it("keeps retry and request metadata", () => {
    const error = new ApiError({ kind: "rate-limited", message: "Slow down", status: 429, retryAfter: 2 });
    expect(error.retryAfter).toBe(2);
    expect(error.requestId).toBe("local");
  });
});
