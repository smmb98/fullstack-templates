import { notFound } from "next/navigation";
import { CatalogListingPage, type ListingQuery } from "@/features/catalog-listing";
import { isFeatureEnabled } from "@/features/flags";

export const metadata = {
  title: "Collection",
};

const sortValues = [
  "relevance",
  "price-asc",
  "price-desc",
  "newest",
  "rating",
  "best-selling",
] as const;

type Sort = (typeof sortValues)[number];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function readSort(value: string | undefined): Sort | undefined {
  return sortValues.includes(value as Sort) ? (value as Sort) : undefined;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isFeatureEnabled("catalogListing")) notFound();

  const params = await searchParams;
  const query: ListingQuery = {
    q: first(params.q)?.trim() || undefined,
    category: first(params.category)?.trim() || undefined,
    sort: readSort(first(params.sort)),
  };

  return <CatalogListingPage initialQuery={query} />;
}
