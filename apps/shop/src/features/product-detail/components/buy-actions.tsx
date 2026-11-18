"use client";

import type { ProductDetail, ProductVariant } from "@fullstack-templates/api-contract";
import { Button } from "@fullstack-templates/ui";
import { formatMoney } from "@/config/locale";
import { availabilityLabel, clampQuantity, stockNote } from "../detail";

export interface BuyActionsProps {
  product: ProductDetail;
  variant: ProductVariant | null;
  quantity: number;
  message: string | null;
  onQuantityChange: (quantity: number) => void;
  onAdd: () => void;
}

/** Shared by the buy box and the sticky bar so both can never disagree about availability. */
export function canBuy(product: ProductDetail, variant: ProductVariant | null): boolean {
  return product.inStock && Boolean(variant?.inStock);
}

export function BuyActions({
  product,
  variant,
  quantity,
  message,
  onQuantityChange,
  onAdd,
}: BuyActionsProps) {
  const available = canBuy(product, variant);
  const max = variant?.stock ?? 0;
  const note = stockNote(product);

  return (
    <div data-testid="buy-actions" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="buy-quantity" className="text-sm font-medium text-ink">
            Quantity
          </label>
          <input
            id="buy-quantity"
            type="number"
            inputMode="numeric"
            min={1}
            max={Math.max(1, max)}
            value={quantity}
            disabled={!available}
            onChange={(event) => onQuantityChange(clampQuantity(Number(event.target.value), max))}
            className="min-h-11 w-20 rounded-md border border-line bg-page px-3 text-sm text-ink disabled:opacity-60"
          />
        </div>
        <Button type="button" onClick={onAdd} disabled={!available} className="min-h-11 flex-1">
          {available ? `Add to bag · ${formatMoney(product.price)}` : "Out of stock"}
        </Button>
      </div>

      <p className="text-sm text-muted">
        <span className="font-medium text-ink">{availabilityLabel(product)}</span>
        {variant ? <span> · {variant.color}{variant.size === "One size" ? "" : ` · ${variant.size}`}</span> : null}
        {note ? <span> · {note}</span> : null}
      </p>

      <p role="status" className="min-h-5 text-sm text-ink">
        {message}
      </p>
    </div>
  );
}

export function StickyBuyBar({
  product,
  variant,
  onAdd,
}: Pick<BuyActionsProps, "product" | "variant" | "onAdd">) {
  const available = canBuy(product, variant);

  return (
    <div
      data-testid="sticky-buy-bar"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 py-3 shadow-lg lg:hidden"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{product.title}</p>
          <p className="text-sm text-muted">
            {formatMoney(product.price)} · {availabilityLabel(product)}
          </p>
        </div>
        <Button type="button" onClick={onAdd} disabled={!available} className="shrink-0">
          {available ? "Add to bag" : "Out of stock"}
        </Button>
      </div>
    </div>
  );
}
