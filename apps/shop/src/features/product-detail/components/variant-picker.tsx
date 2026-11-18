"use client";

import type { ProductVariant } from "@fullstack-templates/api-contract";
import { cn } from "@fullstack-templates/ui";
import { optionAvailability, type VariantSelection } from "../detail";

interface OptionGroupProps {
  legend: string;
  name: string;
  values: Array<{ value: string; available: boolean }>;
  selected: string;
  onSelect: (value: string) => void;
}

function OptionGroup({ legend, name, values, selected, onSelect }: OptionGroupProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-sm font-medium text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map(({ value, available }) => (
          <label
            key={value}
            className={cn(
              "relative inline-flex min-h-11 cursor-pointer items-center rounded-md border px-3 text-sm",
              available ? "border-line text-ink" : "cursor-not-allowed border-line text-muted",
            )}
          >
            <input
              type="radio"
              name={name}
              value={value}
              checked={selected === value}
              disabled={!available}
              onChange={() => onSelect(value)}
              className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 rounded-md peer-checked:border-2 peer-checked:border-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
                available ? "hover:bg-subtle" : "bg-subtle/60",
              )}
            />
            <span className="relative">
              {value}
              {!available ? <span className="sr-only"> (unavailable)</span> : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export interface VariantPickerProps {
  variants: ProductVariant[];
  selection: VariantSelection;
  onPick: (axis: "color" | "size", value: string) => void;
}

export function VariantPicker({ variants, selection, onPick }: VariantPickerProps) {
  const hasColors = new Set(variants.map((variant) => variant.color)).size > 1;
  // "One size" is not a choice the visitor makes, so it never becomes a control.
  const hasSizes = variants.some((variant) => variant.size !== "One size");

  return (
    <div className="flex flex-col gap-5">
      {hasColors ? (
        <OptionGroup
          legend="Colour"
          name="variant-color"
          values={optionAvailability(variants, selection, "color")}
          selected={selection.color}
          onSelect={(value) => onPick("color", value)}
        />
      ) : null}
      {hasSizes ? (
        <OptionGroup
          legend="Size"
          name="variant-size"
          values={optionAvailability(variants, selection, "size")}
          selected={selection.size}
          onSelect={(value) => onPick("size", value)}
        />
      ) : null}
    </div>
  );
}
