import type { Product, Variant } from "./types";

/** Most a customer can order of one made-to-order colour in a single order. */
export const MADE_TO_ORDER_MAX = 10;

export const hasVariants = (p: Product) => (p.variants?.length ?? 0) > 0;

export function findVariant(p: Product, variantId?: string | null): Variant | undefined {
  return variantId ? p.variants?.find((v) => v.id === variantId) : undefined;
}

/** How many of this product (or this colour) can still be bought. */
export function availableQty(p: Product, variantId?: string | null): number {
  if (!hasVariants(p)) return Math.max(0, p.stock);
  const v = findVariant(p, variantId);
  if (!v) return 0;
  return v.mode === "order" ? MADE_TO_ORDER_MAX : Math.max(0, v.stock);
}

/** True if at least one colour (or the product itself) can be bought. */
export function isAvailable(p: Product): boolean {
  if (!hasVariants(p)) return p.stock > 0;
  return p.variants.some((v) => v.mode === "order" || v.stock > 0);
}

export function inStockCount(p: Product): number {
  if (!hasVariants(p)) return Math.max(0, p.stock);
  return p.variants.reduce((n, v) => n + (v.mode === "stock" ? Math.max(0, v.stock) : 0), 0);
}

export function makingTimeText(p: Product): string {
  return p.makingTime?.trim() || "about 2 weeks";
}

/** Short label for a colour, e.g. "Sage · in stock" or "Caramel · made to order". */
export function variantLabel(p: Product, v: Variant): string {
  if (v.mode === "order") return `${v.name} · made to order (ready in ${makingTimeText(p)})`;
  if (v.stock <= 0) return `${v.name} · sold out`;
  return `${v.name} · in stock${v.stock <= 3 ? ` (${v.stock} left)` : ""}`;
}
