import { toCents } from "./money";
import type { Product } from "./types";

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
  const images = Array.isArray(raw.images) ? raw.images.map((x) => String(x)).filter(Boolean).slice(0, 12) : [];
  return {
    ok: true,
    value: {
      name,
      category: str(raw.category, 60),
      price,
      stock,
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
