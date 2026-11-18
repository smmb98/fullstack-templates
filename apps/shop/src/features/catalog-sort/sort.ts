import { productSortSchema, type ProductSort } from "@fullstack-templates/api-contract";

export const sortOptions: ReadonlyArray<{ value: ProductSort; label: string }> = [
  { value: "relevance", label: "Most relevant" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "best-selling", label: "Best selling" },
];

/** Read `?sort=`; unknown or missing values fall back to relevance (undefined). */
export function readSortParam(value: string | undefined): ProductSort | undefined {
  const parsed = productSortSchema.safeParse(value);
  return parsed.success && parsed.data !== "relevance" ? parsed.data : undefined;
}

/** Write `?sort=`: relevance is the default and stays out of the URL. */
export function sortParamValue(sort: ProductSort | undefined): ProductSort | undefined {
  return sort && sort !== "relevance" ? sort : undefined;
}
