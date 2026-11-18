import { z } from "zod";

export const searchSuggestionTypeSchema = z.enum(["product", "category", "brand"]);
export type SearchSuggestionType = z.infer<typeof searchSuggestionTypeSchema>;

export const searchSuggestionSchema = z.object({
  type: searchSuggestionTypeSchema,
  /** Canonical value: product slug, category name or brand name. */
  value: z.string().min(1),
  /** What the user reads in the list. */
  label: z.string().min(1),
  /** Secondary line, e.g. the product category or a type label. */
  detail: z.string().optional(),
});
export type SearchSuggestion = z.infer<typeof searchSuggestionSchema>;

export const searchSuggestQuerySchema = z.object({
  q: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(10).default(6),
});
export type SearchSuggestQuery = z.infer<typeof searchSuggestQuerySchema>;

export const searchSuggestResponseSchema = z.object({
  query: z.string(),
  suggestions: z.array(searchSuggestionSchema),
});
export type SearchSuggestResponse = z.infer<typeof searchSuggestResponseSchema>;
