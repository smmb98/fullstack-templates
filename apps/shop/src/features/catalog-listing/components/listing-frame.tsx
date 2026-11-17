import { Button } from "@showcase/ui";
import type { ReactNode } from "react";
import type { ListingQuery } from "../api";

const sortOptions = [
  { value: "relevance", label: "Most relevant" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "best-selling", label: "Best selling" },
] as const;

export function ListingFrame({ query, children }: { query: ListingQuery; children: ReactNode }) {
  const hasFilters = Boolean(query.q || query.category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <p className="mb-3 text-sm font-medium tracking-[0.18em] text-muted uppercase">
          Hearth &amp; Grain
        </p>
        <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
          The collection
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Furniture, lighting and tableware chosen for the way a room actually feels.
        </p>
      </header>

      <form
        action="/products"
        method="get"
        role="search"
        className="mt-8 flex flex-col gap-3 border-y border-line py-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="catalog-q" className="mb-1 block text-sm font-medium text-ink">
            Search the collection
          </label>
          <input
            id="catalog-q"
            name="q"
            type="search"
            defaultValue={query.q ?? ""}
            placeholder="Try “oak” or “linen”"
            className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          />
        </div>
        <div className="sm:w-56">
          <label htmlFor="catalog-sort" className="mb-1 block text-sm font-medium text-ink">
            Sort by
          </label>
          <select
            id="catalog-sort"
            name="sort"
            defaultValue={query.sort ?? "relevance"}
            className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Search</Button>
        {hasFilters ? (
          <a
            href="/products"
            className="inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Clear filters
          </a>
        ) : null}
      </form>

      <div className="mt-8">{children}</div>
    </div>
  );
}
