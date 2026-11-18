import { z } from "zod";

export const currencySchema = z.enum(["USD", "PKR"]);
export type Currency = z.infer<typeof currencySchema>;

export const moneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: currencySchema,
});
export type Money = z.infer<typeof moneySchema>;

export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type ImageAsset = z.infer<typeof imageSchema>;

export const facetBucketSchema = z.object({
  value: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
  /** Optional swatch colour for colour facets (data-driven, not a theme token). */
  swatch: z.string().optional(),
  /** Top-level category value for subcategory buckets. */
  parent: z.string().nullable().optional(),
});
export type FacetBucket = z.infer<typeof facetBucketSchema>;

export const facetsSchema = z.object({
  categories: z.array(facetBucketSchema).default([]),
  brands: z.array(facetBucketSchema).default([]),
  colors: z.array(facetBucketSchema).default([]),
  materials: z.array(facetBucketSchema).default([]),
  ratings: z.array(facetBucketSchema).default([]),
  price: z
    .object({
      min: z.number().int().nonnegative(),
      max: z.number().int().nonnegative(),
    })
    .optional(),
});
export type Facets = z.infer<typeof facetsSchema>;
