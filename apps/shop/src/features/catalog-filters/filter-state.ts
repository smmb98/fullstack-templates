import { localeConfig, formatMoney } from "@/config/locale";
import type { Facets } from "@fullstack-templates/api-contract";

/** The filter state that lives in the URL and in every products.list request. */
export interface CatalogFilters {
  category?: string;
  brands: string[];
  colors: string[];
  materials: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock: boolean;
  onSale: boolean;
}

export const emptyFilters: CatalogFilters = {
  brands: [],
  colors: [],
  materials: [],
  inStock: false,
  onSale: false,
};

export type FilterChipKind =
  | "category"
  | "brand"
  | "color"
  | "material"
  | "price"
  | "rating"
  | "inStock"
  | "onSale";

export interface FilterChip {
  kind: FilterChipKind;
  value?: string;
  label: string;
}

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function csv(value: string | string[] | undefined): string[] {
  const raw = first(value);
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function amount(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : undefined;
}

function rating(value: string | string[] | undefined): number | undefined {
  const parsed = amount(value);
  return parsed !== undefined && parsed <= 5 ? parsed : undefined;
}

/** Read filters from Next `searchParams` (arrays allowed) or a URLSearchParams-backed object. */
export function readCatalogFilters(params: Params): CatalogFilters {
  return {
    category: first(params.category)?.trim() || undefined,
    brands: csv(params.brand),
    colors: csv(params.color),
    materials: csv(params.material),
    minPrice: amount(params.minPrice),
    maxPrice: amount(params.maxPrice),
    minRating: rating(params.minRating),
    inStock: first(params.inStock) === "true",
    onSale: first(params.onSale) === "true",
  };
}

/** Write filters as URL parameters; empty values are omitted. */
export function filterParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.brands.length > 0) params.set("brand", filters.brands.join(","));
  if (filters.colors.length > 0) params.set("color", filters.colors.join(","));
  if (filters.materials.length > 0) params.set("material", filters.materials.join(","));
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minRating !== undefined) params.set("minRating", String(filters.minRating));
  if (filters.inStock) params.set("inStock", "true");
  if (filters.onSale) params.set("onSale", "true");
  return params;
}

export function activeFilterCount(filters: CatalogFilters): number {
  let count = 0;
  if (filters.category) count += 1;
  count += filters.brands.length + filters.colors.length + filters.materials.length;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count += 1;
  if (filters.minRating !== undefined) count += 1;
  if (filters.inStock) count += 1;
  if (filters.onSale) count += 1;
  return count;
}

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

/**
 * Stable content key for a filter state. Objects are rebuilt on every render, so the
 * panel syncs its optimistic draft against this string instead of object identity.
 */
export function filterSignature(filters: CatalogFilters): string {
  return JSON.stringify([
    filters.category ?? null,
    filters.brands,
    filters.colors,
    filters.materials,
    filters.minPrice ?? null,
    filters.maxPrice ?? null,
    filters.minRating ?? null,
    filters.inStock,
    filters.onSale,
  ]);
}

const money = (amount: number) => formatMoney({ amount, currency: localeConfig.currency });

export function activeChips(filters: CatalogFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filters.category) chips.push({ kind: "category", label: filters.category });
  for (const brand of filters.brands) chips.push({ kind: "brand", value: brand, label: brand });
  for (const color of filters.colors) chips.push({ kind: "color", value: color, label: color });
  for (const material of filters.materials) {
    chips.push({ kind: "material", value: material, label: material });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const from = filters.minPrice !== undefined ? money(filters.minPrice) : "Any";
    const to = filters.maxPrice !== undefined ? money(filters.maxPrice) : "Any";
    chips.push({ kind: "price", label: `${from} – ${to}` });
  }
  if (filters.minRating !== undefined) {
    chips.push({ kind: "rating", label: `${filters.minRating} stars & up` });
  }
  if (filters.inStock) chips.push({ kind: "inStock", label: "In stock" });
  if (filters.onSale) chips.push({ kind: "onSale", label: "On sale" });
  return chips;
}

/** Remove one applied chip; `value` identifies the entry in a multi-select group. */
export function removeChip(filters: CatalogFilters, chip: FilterChip): CatalogFilters {
  switch (chip.kind) {
    case "category":
      return { ...filters, category: undefined };
    case "brand":
      return { ...filters, brands: filters.brands.filter((item) => item !== chip.value) };
    case "color":
      return { ...filters, colors: filters.colors.filter((item) => item !== chip.value) };
    case "material":
      return { ...filters, materials: filters.materials.filter((item) => item !== chip.value) };
    case "price":
      return { ...filters, minPrice: undefined, maxPrice: undefined };
    case "rating":
      return { ...filters, minRating: undefined };
    case "inStock":
      return { ...filters, inStock: false };
    case "onSale":
      return { ...filters, onSale: false };
  }
}

/** A range where the minimum exceeds the maximum is rejected before it reaches the URL. */
export function priceRangeError(min?: number, max?: number): string | undefined {
  if (min !== undefined && max !== undefined && min > max) {
    return "Minimum price must be below the maximum.";
  }
  return undefined;
}

/** Facet labels with counts, e.g. "Decor (3)". */
export function facetLabel(label: string, count: number): string {
  return `${label} (${count})`;
}

export function categoryTree(facets?: Facets) {
  if (!facets) return [];
  const tops = facets.categories.filter((bucket) => !bucket.parent);
  return tops.map((top) => ({
    ...top,
    children: facets.categories.filter((bucket) => bucket.parent === top.value),
  }));
}
