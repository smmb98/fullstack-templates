import type { ProductSort } from "@fullstack-templates/api-contract";
import { Button, cn } from "@fullstack-templates/ui";
import type { ReactNode } from "react";
import { SortControl } from "@/features/catalog-sort";
import type { ListingQuery, ListingView } from "../api";

export interface ListingFrameProps {
  query: ListingQuery;
  searchText: string;
  isLarge: boolean;
  showSort: boolean;
  view: ListingView;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSortChange: (value: ProductSort) => void;
  onViewChange: (value: ListingView) => void;
  /** Sidebar filters (desktop) and drawer trigger (mobile). */
  filters?: ReactNode;
  /** Applied-filter chips above the results. */
  activeFilters?: ReactNode;
  children: ReactNode;
}

export function ListingFrame({
  query,
  searchText,
  isLarge,
  showSort,
  view,
  onSearchChange,
  onSearchSubmit,
  onSortChange,
  onViewChange,
  filters,
  activeFilters,
  children,
}: ListingFrameProps) {
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
        aria-label="Catalog search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
        className="mt-8 flex flex-col gap-3 border-y border-line py-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="flex-1 sm:min-w-56">
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
        {showSort ? <SortControl value={query.sort} onChange={onSortChange} /> : null}
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
      </form>

      {activeFilters}

      <div className="mt-6 grid gap-8 lg:grid-cols-[17rem_1fr]">
        <div>{filters}</div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
