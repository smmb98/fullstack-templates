"use client";

import { ApiError } from "@fullstack-templates/api-contract";
import { Button } from "@fullstack-templates/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  MIN_SUGGEST_LENGTH,
  moveActiveIndex,
  normalizeQuery,
  readRecentSearches,
  rememberSearch,
  suggestionHref,
  writeRecentSearches,
} from "../search";
import { useSearchSuggest } from "../use-search-suggest";
import {
  SearchSuggestions,
  type SearchOption,
  type SearchPanelState,
} from "./search-suggestions";

const LISTBOX_ID = "header-search-listbox";

function errorState(error: unknown): SearchPanelState {
  const kind = error instanceof ApiError ? (error.kind === "validation" ? "http" : error.kind) : "http";
  switch (kind) {
    case "network":
    case "timeout":
    case "rate-limited":
      return `error:${kind}`;
    default:
      return "error:http";
  }
}

export function HeaderSearch() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);

  const { debounced, isActive, data, isPending, isFetching, isError, error, refetch } =
    useSearchSuggest(text, open);

  useEffect(() => {
    setRecent(readRecentSearches(window.localStorage));
  }, []);

  const normalized = normalizeQuery(text);
  const showsRecents = open && normalized.length === 0 && recent.length > 0;
  const wantsMore = open && normalized.length > 0 && normalized.length < MIN_SUGGEST_LENGTH;
  const currentData = data && normalizeQuery(data.query) === normalized ? data : undefined;
  const pending = isActive && (isPending || isFetching || debounced !== normalized);

  const options: SearchOption[] = useMemo(() => {
    if (showsRecents) {
      return recent.map((value, index) => ({
        id: `search-recent-${index}`,
        label: value,
        type: "recent" as const,
        href: `/products?q=${encodeURIComponent(value)}`,
      }));
    }
    if (!currentData) return [];
    return currentData.suggestions.map((suggestion, index) => ({
      id: `search-option-${index}`,
      label: suggestion.label,
      detail: suggestion.detail,
      type: suggestion.type,
      href: suggestionHref(suggestion),
    }));
  }, [currentData, recent, showsRecents]);

  let state: SearchPanelState | "hidden";
  if (!open || (normalized.length === 0 && !showsRecents)) state = "hidden";
  else if (showsRecents || wantsMore) state = "ready";
  else if (pending) state = "loading";
  else if (isError) state = errorState(error);
  else if (!currentData || currentData.suggestions.length === 0) state = "empty:no-results";
  else state = "ready";

  const expanded = state !== "hidden";

  useEffect(() => {
    setActiveIndex(-1);
  }, [normalized, showsRecents]);

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const visit = (href: string, searched: string) => {
    const next = rememberSearch(recent, searched);
    setRecent(next);
    writeRecentSearches(window.localStorage, next);
    setText("");
    close();
    router.push(href);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    visit(option.href, showsRecents ? option.label : normalized);
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (activeIndex >= 0 && options[activeIndex]) {
      choose(activeIndex);
      return;
    }
    if (!normalized) return;
    visit(`/products?q=${encodeURIComponent(normalized)}`, normalized);
  };

  return (
    <form
      role="search"
      aria-label="Site search"
      action="/products"
      method="get"
      onSubmit={submit}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
      className="relative order-3 w-full sm:order-2 sm:w-72"
    >
      <label htmlFor="header-search-input" className="sr-only">
        Search products
      </label>
      <div className="flex gap-2">
        <input
          id="header-search-input"
          name="q"
          type="search"
          value={text}
          placeholder="Search"
          autoComplete="off"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={expanded ? LISTBOX_ID : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            expanded && activeIndex >= 0 ? options[activeIndex]?.id : undefined
          }
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => moveActiveIndex(current, 1, options.length));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => moveActiveIndex(current, -1, options.length));
            } else if (event.key === "Escape") {
              if (expanded) {
                event.preventDefault();
                close();
              }
            }
          }}
          className="min-h-11 w-full rounded-md border border-line bg-page px-3 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </div>

      {state !== "hidden" ? (
        <SearchSuggestions
          state={state}
          query={normalized}
          options={options}
          heading={showsRecents ? "Recent searches" : "Suggestions"}
          activeIndex={activeIndex}
          listboxId={LISTBOX_ID}
          onChoose={choose}
          onActiveChange={setActiveIndex}
          onRetry={() => void refetch()}
          onClearRecents={
            showsRecents
              ? () => {
                  setRecent([]);
                  writeRecentSearches(window.localStorage, []);
                }
              : undefined
          }
        />
      ) : null}
    </form>
  );
}
