"use client";

import { AsyncRegion } from "@fullstack-templates/ui";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { ProductSort } from "@fullstack-templates/api-contract";
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
}: {
  initialQuery: ListingQuery;
  sortEnabled?: boolean;
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

  // Large result sets need an explicit submit; small ones filter as the user types.
  const isLarge = (query.data?.total ?? 0) > LIVE_SEARCH_LIMIT;

  useEffect(() => {
    const nextQ = searchText.trim() || undefined;
    if (nextQ === (committedQ || undefined) || isLarge) return;
    const timer = setTimeout(() => {
      commit(
        { q: nextQ, category: committedCategory, sort: committedSort, view: initialQuery.view },
        "replace",
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText, committedQ, committedCategory, committedSort, isLarge, commit, initialQuery.view]);

  const hasFilters = Boolean(committedQ || committedCategory);
  const hasResults = (query.data?.items.length ?? 1) > 0;

  const applySearch = () => {
    commit(
      {
        q: searchText.trim() || undefined,
        category: committedCategory,
        sort: committedSort,
        view: initialQuery.view,
      },
      "push",
    );
  };

  const applySort = (sort: ProductSort) => {
    commit(
      {
        q: searchText.trim() || undefined,
        category: committedCategory,
        sort: sort === "relevance" ? undefined : sort,
        view: initialQuery.view,
      },
      "push",
    );
  };

  const applyCategory = (category: string | undefined) => {
    commit(
      {
        q: searchText.trim() || undefined,
        category,
        sort: committedSort,
        view: initialQuery.view,
      },
      "push",
    );
  };

  const applyView = (view: ListingView) => {
    commit(
      {
        q: searchText.trim() || undefined,
        category: committedCategory,
        sort: committedSort,
        page: committedPage,
        view: view === "grid" ? undefined : view,
      },
      "replace",
    );
  };

  const applyPage = (page: number) => {
    commit(
      {
        q: searchText.trim() || undefined,
        category: committedCategory,
        sort: committedSort,
        view: committedView === "grid" ? undefined : committedView,
        page: page > 1 ? page : undefined,
      },
      "push",
    );
  };

  const clearFilters = () => {
    setSearchText("");
    commit({ view: initialQuery.view }, "push");
  };

  return (
    <ListingFrame
      query={initialQuery}
      searchText={searchText}
      isLarge={isLarge}
      showClear={hasResults}
      showSort={sortEnabled}
      view={committedView}
      facets={query.data?.facets}
      onSearchChange={setSearchText}
      onSearchSubmit={applySearch}
      onSortChange={applySort}
      onCategoryChange={applyCategory}
      onViewChange={applyView}
      onClear={clearFilters}
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
            pageHref={(page) =>
              listingHref({
                q: searchText.trim() || undefined,
                category: committedCategory,
                sort: committedSort,
                view: committedView,
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
