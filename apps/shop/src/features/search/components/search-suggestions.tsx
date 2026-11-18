"use client";

import type { SearchSuggestion } from "@fullstack-templates/api-contract";
import { Button, cn } from "@fullstack-templates/ui";
import { typeLabel } from "../search";

export type SearchPanelState =
  | "loading"
  | "ready"
  | "empty:no-results"
  | "error:network"
  | "error:timeout"
  | "error:http"
  | "error:rate-limited";

export interface SearchOption {
  id: string;
  label: string;
  detail?: string;
  type: SearchSuggestion["type"] | "recent";
  href: string;
}

export interface SearchSuggestionsProps {
  state: SearchPanelState;
  query: string;
  options: SearchOption[];
  heading: string;
  activeIndex: number;
  listboxId: string;
  onChoose: (index: number) => void;
  onActiveChange: (index: number) => void;
  onRetry: () => void;
  onClearRecents?: () => void;
}

function errorCopy(state: SearchPanelState): string {
  switch (state) {
    case "error:network":
      return "Check your connection and try again.";
    case "error:timeout":
      return "The search took too long. Try again.";
    case "error:rate-limited":
      return "Too many searches in a row. Wait a moment.";
    default:
      return "The search service is having a moment.";
  }
}

/**
 * Presentational popup for the header combobox. It mirrors the AsyncRegion state names and
 * exposes the same `data-state` contract, but renders rows instead of blocks so it stays a
 * valid listbox inside the header form.
 */
export function SearchSuggestions({
  state,
  query,
  options,
  heading,
  activeIndex,
  listboxId,
  onChoose,
  onActiveChange,
  onRetry,
  onClearRecents,
}: SearchSuggestionsProps) {
  const headingId = `${listboxId}-heading`;

  return (
    <div
      data-testid="region-search"
      data-state={state}
      className="absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-lg border border-line bg-surface shadow-lg"
    >
      {state === "loading" ? (
        <p role="status" className="px-4 py-3 text-sm text-muted">
          Looking for “{query}”…
        </p>
      ) : state.startsWith("error:") ? (
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-ink">Suggestions are unavailable.</p>
          <p className="mt-1 text-sm text-muted">{errorCopy(state)}</p>
          <Button type="button" variant="secondary" size="sm" onClick={onRetry} className="mt-3">
            Try again
          </Button>
        </div>
      ) : options.length === 0 ? (
        <p role="status" className="px-4 py-3 text-sm text-muted">
          No matches for “{query}”. Press Enter to search anyway.
        </p>
      ) : (
        <>
          <p
            id={headingId}
            className="px-4 pt-3 pb-1 text-xs font-medium tracking-wide text-muted uppercase"
          >
            {heading}
          </p>
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={headingId}
            className="max-h-80 overflow-y-auto pb-1"
          >
            {options.map((option, index) => (
              <li
                key={option.id}
                id={option.id}
                role="option"
                aria-selected={index === activeIndex}
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => onActiveChange(index)}
                onClick={() => onChoose(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onChoose(index);
                  }
                }}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm",
                  index === activeIndex ? "bg-subtle text-ink" : "text-ink",
                )}
              >
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate">{option.label}</span>
                  {option.detail ? (
                    <span className="shrink-0 text-xs text-muted">{option.detail}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {option.type === "recent" ? "Recent" : typeLabel(option.type)}
                </span>
              </li>
            ))}
          </ul>
          {onClearRecents ? (
            <div className="border-t border-line px-2 py-1">
              <Button type="button" variant="ghost" size="sm" onClick={onClearRecents}>
                Clear recent searches
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
