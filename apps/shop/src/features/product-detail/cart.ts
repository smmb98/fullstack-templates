import type { Money } from "@fullstack-templates/api-contract";

/** Shared with the `cart` slice, which reads and extends the same key. */
export const CART_STORAGE_KEY = "fullstack-templates-cart";
export const MAX_ITEM_QUANTITY = 10;

export interface CartItem {
  slug: string;
  variantId: string;
  title: string;
  color: string;
  size: string;
  unitAmount: number;
  currency: Money["currency"];
  image?: string;
  quantity: number;
}

type ReadStorage = Pick<Storage, "getItem">;
type WriteStorage = Pick<Storage, "setItem">;

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.slug === "string" &&
    typeof item.variantId === "string" &&
    typeof item.title === "string" &&
    typeof item.color === "string" &&
    typeof item.size === "string" &&
    typeof item.unitAmount === "number" &&
    (item.currency === "USD" || item.currency === "PKR") &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}

export function readCart(storage: ReadStorage | undefined): CartItem[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(CART_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem).map((item) => ({
      ...item,
      quantity: Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.trunc(item.quantity))),
    }));
  } catch {
    return [];
  }
}

export function writeCart(storage: WriteStorage | undefined, items: CartItem[]): void {
  if (!storage) return;
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode or a full quota: adding to the bag is a demo action, never a blocker.
  }
}

/** Same product and variant merge; everything else is appended in the order it was added. */
export function addCartItem(items: CartItem[], item: CartItem): CartItem[] {
  const quantity = Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.trunc(item.quantity)));
  const index = items.findIndex(
    (existing) => existing.slug === item.slug && existing.variantId === item.variantId,
  );
  if (index === -1) return [...items, { ...item, quantity }];
  return items.map((existing, position) =>
    position === index
      ? { ...existing, quantity: Math.min(MAX_ITEM_QUANTITY, existing.quantity + quantity) }
      : existing,
  );
}

export function cartQuantity(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartTotal(items: CartItem[]): Money {
  return {
    amount: items.reduce((total, item) => total + item.unitAmount * item.quantity, 0),
    currency: items[0]?.currency ?? "USD",
  };
}
