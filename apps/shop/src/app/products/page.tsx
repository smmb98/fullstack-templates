import { notFound } from "next/navigation";
import {
  CatalogListingPage,
  type ListingQuery,
  type ListingView,
} from "@/features/catalog-listing";
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

function readPage(value: string | undefined): number | undefined {
  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : undefined;
}

function readView(value: string | undefined): ListingView | undefined {
  return value === "list" ? "list" : undefined;
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
    page: readPage(first(params.page)),
    view: readView(first(params.view)),
  };

  return <CatalogListingPage initialQuery={query} />;
}
