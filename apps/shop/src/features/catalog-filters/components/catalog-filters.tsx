"use client";

import type { Facets } from "@fullstack-templates/api-contract";
import { Button } from "@fullstack-templates/ui";
import { useEffect, useRef, useState } from "react";
import { activeFilterCount, type CatalogFilters } from "../filter-state";
import { FilterPanel } from "./filter-panel";

export interface CatalogFiltersProps {
  facets?: Facets;
  value: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  onClear: () => void;
}

/**
 * Desktop sidebar plus a native <dialog> drawer on small screens. Both render the same
 * panel component with distinct id prefixes, so no label ever points at a duplicate id.
 */
export function CatalogFilters({ facets, value, onChange, onClear }: CatalogFiltersProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const count = activeFilterCount(value);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <div className="lg:hidden">
        <Button type="button" variant="secondary" onClick={() => setOpen(true)} aria-haspopup="dialog">
          Filters{count > 0 ? ` (${count})` : ""}
        </Button>
      </div>

      <div className="hidden lg:block">
        <FilterPanel
          facets={facets}
          value={value}
          onChange={onChange}
          onClear={onClear}
          idPrefix="filters-desktop"
        />
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        aria-labelledby="filter-drawer-title"
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-page p-0 text-ink backdrop:bg-ink/40 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:max-w-md sm:rounded-lg"
      >
        <div className="flex min-h-dvh flex-col p-4 sm:min-h-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="filter-drawer-title" className="font-display text-xl text-ink">
              Filters
            </h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <div className="flex-1">
            <FilterPanel
              facets={facets}
              value={value}
              onChange={onChange}
              onClear={onClear}
              idPrefix="filters-mobile"
            />
          </div>
          <div className="sticky bottom-0 mt-4 border-t border-line bg-page pt-3">
            <Button type="button" onClick={() => setOpen(false)} className="w-full">
              Show results
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
