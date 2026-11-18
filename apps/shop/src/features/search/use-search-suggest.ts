"use client";

import { searchSuggestEndpoint } from "@fullstack-templates/api-contract";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { MIN_SUGGEST_LENGTH, normalizeQuery, SEARCH_DEBOUNCE_MS } from "./search";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export const searchKeys = {
  all: ["search"] as const,
  suggest: (query: string) => [...searchKeys.all, "suggest", query] as const,
};

export const SEARCH_SUGGEST_LIMIT = 6;

/** Debounced autosuggest. Disabled until the user has typed two characters. */
export function useSearchSuggest(text: string, enabled: boolean) {
  const query = normalizeQuery(text);
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const isActive = enabled && debounced.length >= MIN_SUGGEST_LENGTH;

  const result = useQuery({
    queryKey: searchKeys.suggest(debounced),
    queryFn: () => apiRequest(searchSuggestEndpoint, { query: { q: debounced, limit: SEARCH_SUGGEST_LIMIT } }),
    enabled: isActive,
    staleTime: 60_000,
  });

  return { query, debounced, isActive, ...result };
}
