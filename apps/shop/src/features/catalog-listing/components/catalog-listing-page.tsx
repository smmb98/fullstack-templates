"use client";

import { AsyncRegion } from "@fullstack-templates/ui";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { ProductSort } from "@fullstack-templates/api-contract";
import {
  ActiveFilters,
  CatalogFilters,
  activeFilterCount,
  emptyFilters,
  removeChip,
  type CatalogFilterState,
} from "@/features/catalog-filters";
import {
  fetchProducts,
  listingHref,
  listingKeys,
  type ListingQuery,
  type ListingView,
} from "../api";
import { ListingFrame } from "./listing-frame";
import { ListingGrid, ListingSkeleton } from "./listing-grid";

const LIVE_SEARCH_LIMIT = 100;
const SEARCH_DEBOUNCE_MS = 300;

export function CatalogListingPage({
  initialQuery,
  sortEnabled = true,
  filtersEnabled = true,
  detailEnabled = true,
}: {
  initialQuery: ListingQuery;
  sortEnabled?: boolean;
  filtersEnabled?: boolean;
  detailEnabled?: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const query = useQuery({
    queryKey: listingKeys.list(initialQuery),
    queryFn: () => fetchProducts(initialQuery),
    placeholderData: keepPreviousData,
  });

  const committedQ = initialQuery.q ?? "";
  const committedCategory = initialQuery.category;
  const committedSort = initialQuery.sort;
  const committedPage = initialQuery.page ?? 1;
  const committedView = initialQuery.view ?? "grid";
  const [searchText, setSearchText] = useState(committedQ);

  const filters: CatalogFilterState = {
    category: committedCategory,
    brands: initialQuery.brands,
    colors: initialQuery.colors,
    materials: initialQuery.materials,
    minPrice: initialQuery.minPrice,
    maxPrice: initialQuery.maxPrice,
    minRating: initialQuery.minRating,
    inStock: initialQuery.inStock,
    onSale: initialQuery.onSale,
  };

  useEffect(() => {
    setSearchText(committedQ);
  }, [committedQ]);

  const commit = useCallback(
    (next: ListingQuery, mode: "push" | "replace" = "push") => {
      const href = listingHref(next);
      startTransition(() => {
        if (mode === "replace") router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
      });
    },
    [router],
  );

  const base = (): ListingQuery => ({
    ...filters,
    q: searchText.trim() || undefined,
    sort: committedSort,
    view: initialQuery.view,
  });

  // Large result sets need an explicit submit; small ones filter as the user types.
  const isLarge = (query.data?.total ?? 0) > LIVE_SEARCH_LIMIT;

  useEffect(() => {
    const nextQ = searchText.trim() || undefined;
    if (nextQ === (committedQ || undefined) || isLarge) return;
    const timer = setTimeout(() => {
      commit({ ...base(), q: nextQ }, "replace");
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // base() is derived from the committed URL fields below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, committedQ, committedCategory, committedSort, isLarge, commit, initialQuery.view]);

  const hasFilters = activeFilterCount(filters) > 0 || Boolean(committedQ);

  const applySearch = () => {
    commit(base(), "push");
  };

  const applySort = (sort: ProductSort) => {
    commit({ ...base(), sort: sort === "relevance" ? undefined : sort }, "push");
  };

  const applyFilters = (next: CatalogFilterState) => {
    commit({ ...next, q: searchText.trim() || undefined, sort: committedSort, view: initialQuery.view }, "push");
  };

  const applyView = (view: ListingView) => {
    commit(
      {
        ...base(),
        page: committedPage,
        view: view === "grid" ? undefined : view,
      },
      "replace",
    );
  };

  const applyPage = (page: number) => {
    commit(
      {
        ...base(),
        page: page > 1 ? page : undefined,
      },
      "push",
    );
  };

  const clearFilters = () => {
    setSearchText("");
    commit(emptyFilters, "push");
  };

  return (
    <ListingFrame
      query={initialQuery}
      searchText={searchText}
      isLarge={isLarge}
      showSort={sortEnabled}
      view={committedView}
      onSearchChange={setSearchText}
      onSearchSubmit={applySearch}
      onSortChange={applySort}
      onViewChange={applyView}
      activeFilters={
        filtersEnabled ? (
          <ActiveFilters
            filters={filters}
            onRemove={(chip) => applyFilters(removeChip(filters, chip))}
            onClear={clearFilters}
          />
        ) : null
      }
      filters={
        filtersEnabled ? (
          <CatalogFilters
            facets={query.data?.facets}
            value={filters}
            onChange={applyFilters}
            onClear={clearFilters}
          />
        ) : null
      }
    >
      <AsyncRegion
        query={query}
        testId="region-catalog-listing"
        skeleton={<ListingSkeleton view={committedView} />}
        isEmpty={(data) => data.items.length === 0}
        emptyVariant={hasFilters ? "no-results" : "first-use"}
        onEmptyAction={clearFilters}
      >
        {(data) => (
          <ListingGrid
            data={data}
            view={committedView}
            productHref={detailEnabled ? (product) => `/products/${product.slug}` : undefined}
            pageHref={(page) =>
              listingHref({
                ...base(),
                page,
              })
            }
            onPageChange={applyPage}
          />
        )}
      </AsyncRegion>
    </ListingFrame>
  );
}
