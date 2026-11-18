import type { ProductDetail, ProductVariant } from "@fullstack-templates/api-contract";

export interface VariantSelection {
  color: string;
  size: string;
}

export function variantLabel(variant: Pick<ProductVariant, "color" | "size">): string {
  return variant.size === "One size" ? variant.color : `${variant.color} · ${variant.size}`;
}

export function firstAvailableVariant(variants: ProductVariant[]): ProductVariant | null {
  return variants.find((variant) => variant.inStock) ?? variants[0] ?? null;
}

export function findVariant(
  variants: ProductVariant[],
  selection: VariantSelection,
): ProductVariant | undefined {
  return variants.find(
    (variant) => variant.color === selection.color && variant.size === selection.size,
  );
}

export function selectionOf(variant: ProductVariant): VariantSelection {
  return { color: variant.color, size: variant.size };
}

/**
 * Picking one axis keeps the other where it is when that combination exists, prefers an
 * in-stock neighbour when it does not, and never leaves the selection empty.
 */
export function pickOption(
  variants: ProductVariant[],
  selection: VariantSelection,
  axis: "color" | "size",
  value: string,
): VariantSelection {
  const other = axis === "color" ? "size" : "color";
  const candidates = variants.filter((variant) => variant[axis] === value);
  const match =
    candidates.find((variant) => variant[other] === selection[other] && variant.inStock) ??
    candidates.find((variant) => variant.inStock) ??
    candidates.find((variant) => variant[other] === selection[other]) ??
    candidates[0];
  return match ? selectionOf(match) : selection;
}

/** Availability of each option value for the *other* axis as currently selected. */
export function optionAvailability(
  variants: ProductVariant[],
  selection: VariantSelection,
  axis: "color" | "size",
): Array<{ value: string; available: boolean }> {
  const other = axis === "color" ? "size" : "color";
  const values = [...new Set(variants.map((variant) => variant[axis]))];
  return values.map((value) => ({
    value,
    available: variants.some(
      (variant) =>
        variant[axis] === value && variant[other] === selection[other] && variant.inStock,
    ),
  }));
}

export function clampQuantity(value: number, max: number): number {
  const ceiling = Math.max(1, Math.min(max, 10));
  if (!Number.isFinite(value)) return 1;
  return Math.min(ceiling, Math.max(1, Math.trunc(value)));
}

export function discountPercent(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round((1 - price / compareAt) * 100);
}

export function availabilityLabel(
  product: Pick<ProductDetail, "inStock" | "stock">,
): string {
  if (!product.inStock) return "Out of stock";
  if (product.stock === 1) return "Only 1 left";
  if (product.stock <= 3) return `Only ${product.stock} left`;
  return "In stock";
}

export function stockNote(product: Pick<ProductDetail, "inStock" | "leadTime">): string | null {
  if (!product.inStock) return product.leadTime ?? "This piece is made to order.";
  return product.leadTime;
}

export function productJsonLd(product: ProductDetail, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.id,
    image: product.images.map((image) => image.src),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating.toFixed(1)),
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      price: (product.price.amount / 100).toFixed(2),
      priceCurrency: product.price.currency,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

/** `<` is escaped so a product title can never break out of the script element. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
