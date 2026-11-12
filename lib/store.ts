import "server-only";
import { put, head, list, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { DEFAULT_SETTINGS, type Order, type Product, type Settings } from "./types";

/**
 * Storage: Vercel Blob in production (connected store: BLOB_STORE_ID via OIDC,
 * or an older BLOB_READ_WRITE_TOKEN), local files in .data/ and public/uploads/
 * when running on your own computer.
 */
export const blobConnected = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
const useBlob = blobConnected;
const LOCAL_DIR = path.join(process.cwd(), ".data");

function assertStorage() {
  if (!useBlob && process.env.VERCEL) {
    throw new Error(
      "No storage connected. In Vercel, open the project > Storage > Create > Blob, connect it, then redeploy."
    );
  }
}

/*
 * Why two copies: Vercel Blob caches an overwritten file for up to ~60 seconds, so reading
 * the main file right after a save can return the previous version. Every save therefore
 * also writes a brand-new, never-overwritten "version" file, which is readable immediately.
 *  - Public pages read the main file (fast, cheap; may lag a save by up to a minute).
 *  - The admin and every save read the newest version file ("fresh"), so changes made in
 *    quick succession never overwrite each other.
 */
const KEEP_VERSIONS = 5;
const versionPrefix = (key: string) => `${key}.versions/`;
const urlCache = new Map<string, string>();
let lastStamp = 0;

async function fetchJSON<T>(url: string): Promise<T | undefined> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return undefined;
  return (await res.json()) as T;
}

async function newestVersionUrl(key: string): Promise<string | undefined> {
  const page = await list({ prefix: versionPrefix(key), limit: 1000 });
  const newest = page.blobs.sort((a, b) => b.pathname.localeCompare(a.pathname))[0];
  return newest?.url;
}

export async function readJSON<T>(key: string, fallback: T, opts: { fresh?: boolean } = {}): Promise<T> {
  assertStorage();
  if (useBlob) {
    try {
      if (opts.fresh) {
        const url = await newestVersionUrl(key);
        if (url) {
          const data = await fetchJSON<T>(url);
          if (data !== undefined) return data;
        }
      }
      let url = urlCache.get(key);
      if (!url) {
        url = (await head(key)).url;
        urlCache.set(key, url);
      }
      const data = await fetchJSON<T>(url);
      return data === undefined ? fallback : data;
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

export async function writeJSON(key: string, value: unknown, opts: { versioned?: boolean } = {}): Promise<void> {
  assertStorage();
  const body = JSON.stringify(value, null, 2);
  if (useBlob && opts.versioned === false) {
    await put(key, body, { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 });
    return;
  }
  if (useBlob) {
    lastStamp = Math.max(Date.now(), lastStamp + 1);
    const stamp = String(lastStamp).padStart(15, "0");
    await put(`${versionPrefix(key)}${stamp}-${randomUUID().slice(0, 8)}.json`, body, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    const main = await put(key, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    urlCache.set(key, main.url);
    try {
      const page = await list({ prefix: versionPrefix(key), limit: 1000 });
      const old = page.blobs
        .sort((a, b) => b.pathname.localeCompare(a.pathname))
        .slice(KEEP_VERSIONS)
        .map((b) => b.url);
      if (old.length) await del(old);
    } catch {
      /* tidying old versions is optional */
    }
    return;
  }
  const file = path.join(LOCAL_DIR, key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body, "utf8");
}

/* ---------- Products ---------- */

/** fresh: true reads the newest saved version (use in the admin and before any save). */
export async function getProducts(opts: { fresh?: boolean } = {}): Promise<Product[]> {
  const items = (await readJSON<Product[]>("data/products.json", [], opts)).map((p) => ({
    ...p,
    variants: p.variants ?? [],
    makingTime: p.makingTime ?? "",
  }));
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPublishedProducts(): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.published);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return (await getProducts({ fresh: true })).find((p) => p.id === id);
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
  const all = await getProducts({ fresh: true });
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
  const all = await getProducts({ fresh: true });
  await writeJSON("data/products.json", all.filter((p) => p.id !== id));
}

export async function adjustStock(changes: { productId: string; variantId?: string; qty: number }[]): Promise<void> {
  const all = await getProducts({ fresh: true });
  for (const c of changes) {
    const p = all.find((x) => x.id === c.productId);
    if (!p) continue;
    const v = c.variantId ? p.variants.find((x) => x.id === c.variantId) : undefined;
    if (v) {
      if (v.mode === "stock") v.stock = Math.max(0, v.stock - c.qty);
      p.stock = p.variants.reduce((n, x) => n + (x.mode === "stock" ? x.stock : 0), 0);
    } else if (!p.variants.length) {
      p.stock = Math.max(0, p.stock - c.qty);
    }
  }
  await writeJSON("data/products.json", all);
}

/* ---------- Settings ---------- */

export async function getSettings(opts: { fresh?: boolean } = {}): Promise<Settings> {
  const saved = await readJSON<Partial<Settings>>("data/settings.json", {}, opts);
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(s: Settings): Promise<void> {
  await writeJSON("data/settings.json", s);
}

/* ---------- Orders ---------- */

export async function saveOrder(order: Order): Promise<void> {
  await writeJSON(`orders/${order.id}.json`, order, { versioned: false });
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
      ids.push(...page.blobs.map((b) => b.pathname).filter((p) => /^orders\/[a-f0-9-]{36}\.json$/.test(p)).map((p) => p.slice(7, -5)));
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
