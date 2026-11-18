"use client";

import type { Facets } from "@fullstack-templates/api-contract";
import { Button, cn } from "@fullstack-templates/ui";
import { useEffect, useState, type ReactNode } from "react";
import {
  activeFilterCount,
  categoryTree,
  facetLabel,
  filterSignature,
  priceRangeError,
  toggleValue,
  type CatalogFilters,
} from "../filter-state";

export interface FilterPanelProps {
  facets?: Facets;
  value: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  onClear: () => void;
  /** Unique prefix so the desktop panel and mobile drawer never share input ids. */
  idPrefix: string;
}

const rowClass = (active: boolean) =>
  cn(
    "flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-sm transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    active ? "bg-primary text-on-primary" : "text-ink hover:bg-subtle",
  );

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <legend className="mb-2 text-sm font-semibold text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="text-xs font-normal tabular-nums opacity-70">
      {" ("}
      {value}
      {")"}
    </span>
  );
}

export function FilterPanel({ facets, value, onChange, onClear, idPrefix }: FilterPanelProps) {
  // Committing a filter is a client navigation, so the control must show the click at
  // once: the draft is optimistic and re-synced whenever the committed URL catches up.
  const [draft, setDraft] = useState(value);
  const signature = filterSignature(value);
  useEffect(() => {
    setDraft(value);
    // Re-sync only when the committed filters change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  const update = (next: CatalogFilters) => {
    setDraft(next);
    onChange(next);
  };

  const bounds = facets?.price ?? { min: 0, max: 0 };
  const toText = (amount?: number) => (amount === undefined ? "" : String(amount / 100));
  const [minText, setMinText] = useState(toText(draft.minPrice));
  const [maxText, setMaxText] = useState(toText(draft.maxPrice));

  useEffect(() => {
    setMinText(toText(draft.minPrice));
    setMaxText(toText(draft.maxPrice));
  }, [draft.minPrice, draft.maxPrice]);

  const parse = (text: string): number | undefined => {
    if (text.trim() === "") return undefined;
    const parsed = Number(text);
    if (!Number.isFinite(parsed) || parsed < 0) return undefined;
    return Math.round(parsed * 100);
  };

  const draftMin = parse(minText);
  const draftMax = parse(maxText);
  const invalidNumber =
    (minText.trim() !== "" && draftMin === undefined) ||
    (maxText.trim() !== "" && draftMax === undefined);
  const rangeError = invalidNumber
    ? "Enter a price of zero or more."
    : priceRangeError(draftMin, draftMax);
  const priceDirty = draftMin !== draft.minPrice || draftMax !== draft.maxPrice;

  const applyPrice = () => {
    if (rangeError) return;
    update({ ...draft, minPrice: draftMin, maxPrice: draftMax });
  };

  const count = activeFilterCount(draft);
  const tree = categoryTree(facets);

  return (
    <div data-testid="filters-panel" className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-ink">Filters</h2>
        {count > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 rounded-md px-2 text-sm font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="mt-3">
        {tree.length > 0 ? (
          <Group title="Category">
            <ul className="space-y-0.5">
              {tree.map((top) => (
                <li key={top.value}>
                  <button
                    type="button"
                    aria-pressed={draft.category === top.value}
                    onClick={() =>
                      update({
                        ...draft,
                        category: draft.category === top.value ? undefined : top.value,
                      })
                    }
                    className={rowClass(draft.category === top.value)}
                  >
                    <span>{top.label}</span>
                    <Count value={top.count} />
                  </button>
                  {top.children.length > 0 ? (
                    <ul className="mt-0.5 space-y-0.5 pl-3">
                      {top.children.map((child) => (
                        <li key={child.value}>
                          <button
                            type="button"
                            aria-pressed={draft.category === child.value}
                            onClick={() =>
                              update({
                                ...draft,
                                category: draft.category === child.value ? undefined : child.value,
                              })
                            }
                            className={rowClass(draft.category === child.value)}
                          >
                            <span>{child.label}</span>
                            <Count value={child.count} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </Group>
        ) : null}

        {facets && facets.brands.length > 0 ? (
          <Group title="Brand">
            <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {facets.brands.map((brand) => (
                <li key={brand.value}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={draft.brands.includes(brand.value)}
                      onChange={() =>
                        update({ ...draft, brands: toggleValue(draft.brands, brand.value) })
                      }
                      className="h-4 w-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    />
                    <span className="flex-1">{brand.label}</span>
                    <Count value={brand.count} />
                  </label>
                </li>
              ))}
            </ul>
          </Group>
        ) : null}

        <Group title="Price">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label htmlFor={`${idPrefix}-min-price`} className="sr-only">
                Minimum price
              </label>
              <input
                id={`${idPrefix}-min-price`}
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                placeholder={`$${(bounds.min / 100).toFixed(0)}`}
                value={minText}
                onChange={(event) => setMinText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyPrice();
                  }
                }}
                className="min-h-11 w-full rounded-md border border-line bg-surface px-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              />
              <span aria-hidden="true" className="text-muted">
                –
              </span>
              <label htmlFor={`${idPrefix}-max-price`} className="sr-only">
                Maximum price
              </label>
              <input
                id={`${idPrefix}-max-price`}
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                placeholder={`$${(bounds.max / 100).toFixed(0)}`}
                value={maxText}
                onChange={(event) => setMaxText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyPrice();
                  }
                }}
                className="min-h-11 w-full rounded-md border border-line bg-surface px-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              />
            </div>
            <div>
              <label htmlFor={`${idPrefix}-min-slider`} className="text-xs text-muted">
                Minimum slider
              </label>
              <input
                id={`${idPrefix}-min-slider`}
                type="range"
                min={bounds.min}
                max={bounds.max}
                step={100}
                value={draftMin ?? bounds.min}
                onChange={(event) => setMinText(String(Number(event.target.value) / 100))}
                onPointerUp={applyPrice}
                onKeyUp={applyPrice}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label htmlFor={`${idPrefix}-max-slider`} className="text-xs text-muted">
                Maximum slider
              </label>
              <input
                id={`${idPrefix}-max-slider`}
                type="range"
                min={bounds.min}
                max={bounds.max}
                step={100}
                value={draftMax ?? bounds.max}
                onChange={(event) => setMaxText(String(Number(event.target.value) / 100))}
                onPointerUp={applyPrice}
                onKeyUp={applyPrice}
                className="w-full accent-primary"
              />
            </div>
            {rangeError ? (
              <p role="alert" className="text-xs text-danger">
                {rangeError}
              </p>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={applyPrice}
              disabled={Boolean(rangeError) || !priceDirty}
            >
              Apply price
            </Button>
          </div>
        </Group>

        {facets && facets.ratings.length > 0 ? (
          <Group title="Rating">
            <div className="flex flex-wrap gap-2">
              {facets.ratings.map((bucket) => {
                const threshold = Number(bucket.value);
                const active = draft.minRating === threshold;
                return (
                  <button
                    key={bucket.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      update({ ...draft, minRating: active ? undefined : threshold })
                    }
                    className={cn(
                      "inline-flex min-h-11 items-center gap-1 rounded-full border px-3 text-sm",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                      active
                        ? "border-primary bg-primary text-on-primary"
                        : "border-line bg-surface text-ink hover:bg-subtle",
                    )}
                  >
                    <span aria-hidden="true">★</span>
                    {`${bucket.value}+`}
                    <Count value={bucket.count} />
                  </button>
                );
              })}
            </div>
          </Group>
        ) : null}

        <Group title="Availability">
          <ul className="space-y-1">
            <li>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={draft.inStock}
                  onChange={(event) => update({ ...draft, inStock: event.target.checked })}
                  className="h-4 w-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                />
                In stock only
              </label>
            </li>
            <li>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={draft.onSale}
                  onChange={(event) => update({ ...draft, onSale: event.target.checked })}
                  className="h-4 w-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                />
                On sale
              </label>
            </li>
          </ul>
        </Group>

        {facets && facets.colors.length > 0 ? (
          <Group title="Colour">
            <ul className="flex flex-wrap gap-2">
              {facets.colors.map((color) => {
                const active = draft.colors.includes(color.value);
                return (
                  <li key={color.value}>
                    <button
                      type="button"
                      aria-pressed={active}
                      aria-label={facetLabel(color.label, color.count)}
                      title={facetLabel(color.label, color.count)}
                      onClick={() =>
                        update({ ...draft, colors: toggleValue(draft.colors, color.value) })
                      }
                      className={cn(
                        "inline-flex min-h-11 items-center gap-2 rounded-full border px-2 text-xs",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                        active ? "border-primary ring-2 ring-primary" : "border-line hover:bg-subtle",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 rounded-full border border-line"
                        style={{ backgroundColor: color.swatch ?? "transparent" }}
                      />
                      {color.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Group>
        ) : null}

        {facets && facets.materials.length > 0 ? (
          <Group title="Material">
            <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {facets.materials.map((material) => (
                <li key={material.value}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={draft.materials.includes(material.value)}
                      onChange={() =>
                        update({
                          ...draft,
                          materials: toggleValue(draft.materials, material.value),
                        })
                      }
                      className="h-4 w-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    />
                    <span className="flex-1">{material.label}</span>
                    <Count value={material.count} />
                  </label>
                </li>
              ))}
            </ul>
          </Group>
        ) : null}
      </div>
    </div>
  );
}
