import type { Facets, ProductSort } from "@fullstack-templates/api-contract";
import { Button, cn } from "@fullstack-templates/ui";
import type { ReactNode } from "react";
import type { ListingQuery, ListingView } from "../api";

const sortOptions = [
  { value: "relevance", label: "Most relevant" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "best-selling", label: "Best selling" },
] as const;

export interface ListingFrameProps {
  query: ListingQuery;
  searchText: string;
  isLarge: boolean;
  /** The empty state owns the clear-filters action, so the form hides its own. */
  showClear: boolean;
  view: ListingView;
  facets?: Facets;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSortChange: (value: ProductSort) => void;
  onCategoryChange: (value: string | undefined) => void;
  onViewChange: (value: ListingView) => void;
  onClear: () => void;
  children: ReactNode;
}

const chipClass = (active: boolean) =>
  cn(
    "inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    active
      ? "border-primary bg-primary text-on-primary"
      : "border-line bg-surface text-ink hover:bg-subtle",
  );

export function ListingFrame({
  query,
  searchText,
  isLarge,
  showClear,
  view,
  facets,
  onSearchChange,
  onSearchSubmit,
  onSortChange,
  onCategoryChange,
  onViewChange,
  onClear,
  children,
}: ListingFrameProps) {
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
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
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
            value={searchText}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Try “oak” or “linen”"
            aria-describedby={isLarge ? "catalog-search-hint" : undefined}
            className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          />
          {isLarge ? (
            <p id="catalog-search-hint" className="mt-1 text-xs text-muted">
              Large collection: press Search so we do not query on every keystroke.
            </p>
          ) : null}
        </div>
        <div className="sm:w-56">
          <label htmlFor="catalog-sort" className="mb-1 block text-sm font-medium text-ink">
            Sort by
          </label>
          <select
            id="catalog-sort"
            name="sort"
            value={query.sort ?? "relevance"}
            onChange={(event) => onSortChange(event.target.value as ProductSort)}
            className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span id="catalog-view-label" className="mb-1 block text-sm font-medium text-ink">
            Layout
          </span>
          <div
            role="group"
            aria-labelledby="catalog-view-label"
            className="flex gap-1 rounded-md border border-line bg-surface p-1"
          >
            {(["grid", "list"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => onViewChange(option)}
                className={cn(
                  "min-h-11 min-w-16 rounded px-3 text-sm font-medium capitalize transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  view === option
                    ? "bg-primary text-on-primary"
                    : "text-ink hover:bg-subtle",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {isLarge ? <Button type="submit">Search</Button> : null}
        {hasFilters && showClear ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Clear filters
          </button>
        ) : null}
      </form>

      {facets && facets.categories.length > 0 ? (
        <div
          role="group"
          aria-label="Filter by category"
          className="mt-4 flex flex-wrap items-center gap-2 border-b border-line pb-4"
        >
          <span className="mr-1 text-sm font-medium text-ink">Category</span>
          <button
            type="button"
            aria-pressed={!query.category}
            onClick={() => onCategoryChange(undefined)}
            className={chipClass(!query.category)}
          >
            All
          </button>
          {facets.categories.map((category) => {
            const active = query.category === category.value;
            return (
              <button
                key={category.value}
                type="button"
                aria-pressed={active}
                onClick={() => onCategoryChange(active ? undefined : category.value)}
                className={chipClass(active)}
              >
                {category.label}
                <span className="text-xs opacity-70">{category.count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-8">{children}</div>
    </div>
  );
}
