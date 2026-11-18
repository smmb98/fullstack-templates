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
