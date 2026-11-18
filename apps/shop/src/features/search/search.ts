import type { SearchSuggestion } from "@fullstack-templates/api-contract";

export const RECENT_SEARCHES_KEY = "fullstack-templates-recent-searches";
export const MAX_RECENT_SEARCHES = 5;
export const MIN_SUGGEST_LENGTH = 2;
export const SEARCH_DEBOUNCE_MS = 250;

/** Collapse whitespace and cap the length so a pasted paragraph never hits the API. */
export function normalizeQuery(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 80);
}

/** Newest first, case-insensitively de-duplicated, capped. */
export function rememberSearch(recent: string[], raw: string): string[] {
  const query = normalizeQuery(raw);
  if (!query) return recent.slice(0, MAX_RECENT_SEARCHES);
  const withoutDuplicate = recent.filter((item) => item.toLowerCase() !== query.toLowerCase());
  return [query, ...withoutDuplicate].slice(0, MAX_RECENT_SEARCHES);
}

export function readRecentSearches(
  storage: Pick<Storage, "getItem"> | undefined,
): string[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map(normalizeQuery)
      .filter(Boolean)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function writeRecentSearches(
  storage: Pick<Storage, "setItem"> | undefined,
  recent: string[],
): void {
  if (!storage) return;
  try {
    storage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)));
  } catch {
    // Private mode or a full quota: recents are a convenience, never a requirement.
  }
}

/**
 * Suggestions stay inside the catalog's URL contract: a product searches its title until
 * the `product-detail` slice adds a page, categories and brands apply their own filter.
 */
export function suggestionHref(
  suggestion: Pick<SearchSuggestion, "type" | "value" | "label">,
): string {
  switch (suggestion.type) {
    case "category":
      return `/products?category=${encodeURIComponent(suggestion.value)}`;
    case "brand":
      return `/products?brand=${encodeURIComponent(suggestion.value)}`;
    case "product":
      return `/products?q=${encodeURIComponent(suggestion.label)}`;
  }
}

/** Arrow-key movement that wraps at both ends and starts at the right edge. */
export function moveActiveIndex(current: number, delta: number, length: number): number {
  if (length === 0) return -1;
  if (current < 0) return delta > 0 ? 0 : length - 1;
  return (current + delta + length) % length;
}

export function typeLabel(type: SearchSuggestion["type"]): string {
  switch (type) {
    case "product":
      return "Product";
    case "category":
      return "Category";
    case "brand":
      return "Brand";
  }
}
