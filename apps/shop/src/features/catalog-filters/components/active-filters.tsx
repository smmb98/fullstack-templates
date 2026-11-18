"use client";

import { Button } from "@fullstack-templates/ui";
import {
  activeChips,
  activeFilterCount,
  type CatalogFilters,
  type FilterChip,
} from "../filter-state";

export interface ActiveFiltersProps {
  filters: CatalogFilters;
  onRemove: (chip: FilterChip) => void;
  onClear: () => void;
}

export function ActiveFilters({ filters, onRemove, onClear }: ActiveFiltersProps) {
  const chips = activeChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Applied filters" role="group">
      <span className="text-sm font-medium text-ink">
        {activeFilterCount(filters)} applied
      </span>
      {chips.map((chip) => (
        <button
          key={`${chip.kind}-${chip.value ?? "range"}`}
          type="button"
          onClick={() => onRemove(chip)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm text-ink hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {chip.label}
          <span aria-hidden="true">×</span>
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={onClear}>
        Clear all
      </Button>
    </div>
  );
}
