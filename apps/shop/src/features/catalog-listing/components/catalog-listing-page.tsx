"use client";

import { AsyncRegion } from "@showcase/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchProducts, listingKeys, type ListingQuery } from "../api";
import { ListingFrame } from "./listing-frame";
import { ListingGrid, ListingSkeleton } from "./listing-grid";

export function CatalogListingPage({ initialQuery }: { initialQuery: ListingQuery }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: listingKeys.list(initialQuery),
    queryFn: () => fetchProducts(initialQuery),
  });
  const hasFilters = Boolean(initialQuery.q || initialQuery.category);

  const clearFilters = () => {
    if (hasFilters) router.replace("/products");
    else void query.refetch();
  };

  return (
    <ListingFrame query={initialQuery}>
      <AsyncRegion
        query={query}
        testId="region-catalog-listing"
        skeleton={<ListingSkeleton />}
        isEmpty={(data) => data.items.length === 0}
        emptyVariant={hasFilters ? "no-results" : "first-use"}
        onEmptyAction={clearFilters}
      >
        {(data) => <ListingGrid data={data} />}
      </AsyncRegion>
    </ListingFrame>
  );
}
