import { z } from "zod";
import { facetsSchema, imageSchema, moneySchema } from "./common";

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  price: moneySchema,
  compareAtPrice: moneySchema.nullable(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  brand: z.string().nullable(),
  category: z.string().min(1),
  categoryPath: z.array(z.string()).default([]),
  images: z.array(imageSchema),
  inStock: z.boolean(),
  stock: z.number().int().nonnegative(),
  colors: z.array(z.string()).default([]),
  materials: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  createdAt: z.iso.datetime(),
});
export type Product = z.infer<typeof productSchema>;

/** One buyable combination of colour and size. `One size` when the product has no sizes. */
export const productVariantSchema = z.object({
  id: z.string().min(1),
  color: z.string().min(1),
  size: z.string().min(1),
  inStock: z.boolean(),
  stock: z.number().int().nonnegative(),
});
export type ProductVariant = z.infer<typeof productVariantSchema>;

export const productSpecSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});
export type ProductSpec = z.infer<typeof productSpecSchema>;

/** Extra fields the detail page needs; the listing stays lean. */
export const productDetailSchema = productSchema.extend({
  highlights: z.array(z.string()).default([]),
  specs: z.array(productSpecSchema).default([]),
  care: z.array(z.string()).default([]),
  variants: z.array(productVariantSchema).default([]),
  /** Honest delivery note derived from stock, e.g. "Made to order · 6–8 weeks". */
  leadTime: z.string().nullable().default(null),
});
export type ProductDetail = z.infer<typeof productDetailSchema>;

export const productDetailQuerySchema = z.object({
  /** The slug is the URL identity, so it can be a little longer than a title. */
  slug: z.string().trim().min(1).max(160),
});
export type ProductDetailQuery = z.infer<typeof productDetailQuerySchema>;

export const productDetailResponseSchema = z.object({
  product: productDetailSchema,
  /** Set when some sections (images, specs) could not be loaded. */
  partial: z.boolean().optional(),
});
export type ProductDetailResponse = z.infer<typeof productDetailResponseSchema>;

export const productSortSchema = z.enum([
  "relevance",
  "price-asc",
  "price-desc",
  "newest",
  "rating",
  "best-selling",
]);
export type ProductSort = z.infer<typeof productSortSchema>;

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(60).default(12),
  sort: productSortSchema.default("relevance"),
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  /** Comma-separated brand values. */
  brand: z.string().trim().max(400).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  /** Comma-separated colour values. */
  color: z.string().trim().max(400).optional(),
  /** Comma-separated material values. */
  material: z.string().trim().max(400).optional(),
  inStock: z.enum(["true", "false"]).optional(),
  onSale: z.enum(["true", "false"]).optional(),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productListResponseSchema = z.object({
  items: z.array(productSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().nonnegative(),
  facets: facetsSchema.optional(),
  partial: z.boolean().optional(),
});
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
