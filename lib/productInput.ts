import { toCents } from "./money";
import { randomUUID } from "crypto";
import type { Product, Variant } from "./types";

type Raw = Record<string, unknown>;
const str = (v: unknown, n = 2000) => String(v ?? "").trim().slice(0, n);

export function parseProductInput(raw: Raw):
  | { ok: true; value: Omit<Product, "id" | "slug" | "createdAt" | "updatedAt"> }
  | { ok: false; error: string } {
  const name = str(raw.name, 120);
  if (!name) return { ok: false, error: "Please give the product a name." };
  const price = toCents(str(raw.price));
  if (price < 200) return { ok: false, error: "Please enter a price of at least R2." };
  const stock = Math.max(0, Math.floor(Number(raw.stock) || 0));
  const hoursNum = Number(raw.hours);
  const variants: Variant[] = Array.isArray(raw.variants)
    ? (raw.variants as Record<string, unknown>[])
        .map((v) => ({
          id: str(v.id, 60) || randomUUID().slice(0, 8),
          name: str(v.name, 40),
          mode: v.mode === "order" ? ("order" as const) : ("stock" as const),
          stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
        }))
        .filter((v) => v.name)
        .slice(0, 30)
    : [];
  const images = Array.isArray(raw.images) ? raw.images.map((x) => String(x)).filter(Boolean).slice(0, 12) : [];
  return {
    ok: true,
    value: {
      name,
      category: str(raw.category, 60),
      price,
      stock: variants.length ? variants.reduce((n, v) => n + (v.mode === "stock" ? v.stock : 0), 0) : stock,
      variants,
      makingTime: str(raw.makingTime, 60),
      description: str(raw.description, 4000),
      materials: str(raw.materials, 300),
      size: str(raw.size, 300),
      care: str(raw.care, 300),
      hours: Number.isFinite(hoursNum) && hoursNum > 0 ? Math.round(hoursNum) : null,
      images,
      featured: Boolean(raw.featured),
      published: Boolean(raw.published),
    },
  };
}
