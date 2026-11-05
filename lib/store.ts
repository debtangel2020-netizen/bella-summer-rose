import "server-only";
import { put, head, list, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { DEFAULT_SETTINGS, type Order, type Product, type Settings } from "./types";

/**
 * Storage: Vercel Blob in production (BLOB_READ_WRITE_TOKEN set),
 * local files in .data/ and public/uploads/ when running on your own computer.
 */
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const LOCAL_DIR = path.join(process.cwd(), ".data");

function assertStorage() {
  if (!useBlob && process.env.VERCEL) {
    throw new Error(
      "No storage connected. In Vercel, open the project > Storage > Create > Blob, connect it, then redeploy."
    );
  }
}

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  assertStorage();
  if (useBlob) {
    try {
      const meta = await head(key);
      const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return fallback;
      return (await res.json()) as T;
    } catch {
      return fallback;
    }
  }
  try {
    const raw = await fs.readFile(path.join(LOCAL_DIR, key), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  assertStorage();
  const body = JSON.stringify(value, null, 2);
  if (useBlob) {
    await put(key, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return;
  }
  const file = path.join(LOCAL_DIR, key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body, "utf8");
}

/* ---------- Products ---------- */

export async function getProducts(): Promise<Product[]> {
  const items = await readJSON<Product[]>("data/products.json", []);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPublishedProducts(): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.published);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.id === id);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "item";
}

export async function saveProduct(
  input: Omit<Product, "id" | "slug" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<Product> {
  const all = await getProducts();
  const now = new Date().toISOString();
  const existing = input.id ? all.find((p) => p.id === input.id) : undefined;

  let slug = existing?.slug ?? slugify(input.name);
  if (!existing) {
    let n = 2;
    const base = slug;
    while (all.some((p) => p.slug === slug)) slug = `${base}-${n++}`;
  }

  const product: Product = {
    ...input,
    id: existing?.id ?? randomUUID(),
    slug,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const next = existing ? all.map((p) => (p.id === product.id ? product : p)) : [product, ...all];
  await writeJSON("data/products.json", next);
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  const all = await getProducts();
  await writeJSON("data/products.json", all.filter((p) => p.id !== id));
}

export async function adjustStock(changes: { productId: string; qty: number }[]): Promise<void> {
  const all = await getProducts();
  for (const c of changes) {
    const p = all.find((x) => x.id === c.productId);
    if (p) p.stock = Math.max(0, p.stock - c.qty);
  }
  await writeJSON("data/products.json", all);
}

/* ---------- Settings ---------- */

export async function getSettings(): Promise<Settings> {
  const saved = await readJSON<Partial<Settings>>("data/settings.json", {});
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(s: Settings): Promise<void> {
  await writeJSON("data/settings.json", s);
}

/* ---------- Orders ---------- */

export async function saveOrder(order: Order): Promise<void> {
  await writeJSON(`orders/${order.id}.json`, order);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  if (!/^[a-f0-9-]{36}$/.test(id)) return undefined;
  return readJSON<Order | undefined>(`orders/${id}.json`, undefined);
}

export async function getOrders(): Promise<Order[]> {
  assertStorage();
  let ids: string[] = [];
  if (useBlob) {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: "orders/", cursor, limit: 1000 });
      ids.push(...page.blobs.map((b) => b.pathname.replace(/^orders\//, "").replace(/\.json$/, "")));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } else {
    try {
      ids = (await fs.readdir(path.join(LOCAL_DIR, "orders"))).map((f) => f.replace(/\.json$/, ""));
    } catch {
      ids = [];
    }
  }
  const orders = await Promise.all(ids.map((id) => getOrder(id)));
  return orders
    .filter((o): o is Order => Boolean(o))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ---------- Images ---------- */

export async function uploadImage(file: File): Promise<string> {
  assertStorage();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `products/${randomUUID()}.${ext}`;
  if (useBlob) {
    const blob = await put(name, file, { access: "public", contentType: file.type || "image/jpeg" });
    return blob.url;
  }
  const dest = path.join(process.cwd(), "public", "uploads", name);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function deleteImage(url: string): Promise<void> {
  if (useBlob && url.startsWith("https://")) {
    try {
      await del(url);
    } catch {
      /* already gone */
    }
  }
}
