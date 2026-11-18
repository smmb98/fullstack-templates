import type { ProductSort } from "@fullstack-templates/api-contract";
import { sortOptions } from "../sort";

export interface SortControlProps {
  value?: ProductSort;
  onChange: (sort: ProductSort) => void;
  /** Prefix for the select id when more than one control is on a page. */
  id?: string;
}

export function SortControl({ value, onChange, id = "catalog-sort" }: SortControlProps) {
  return (
    <div className="sm:w-56">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        Sort by
      </label>
      <select
        id={id}
        name="sort"
        value={value ?? "relevance"}
        onChange={(event) => onChange(event.target.value as ProductSort)}
        className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
