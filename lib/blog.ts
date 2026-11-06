import "server-only";
import { readJSON, writeJSON } from "./store";
import bundled from "./posts.generated.json";

export type BlogPost = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  category: string;
  body: string; // Markdown
  /** "auto" = written by the scheduled task (lives in the code repo), "own" = written by Heleen in the admin */
  source: "auto" | "own";
  hidden?: boolean;
  edited?: boolean;
};

type Override = Partial<Pick<BlogPost, "title" | "summary" | "category" | "body" | "hidden">>;
type BlogStore = { overrides: Record<string, Override>; own: BlogPost[] };

const KEY = "data/blog.json";

async function load(fresh = false): Promise<BlogStore> {
  const s = await readJSON<Partial<BlogStore>>(KEY, {}, { fresh });
  return { overrides: s.overrides ?? {}, own: s.own ?? [] };
}

/** All posts, newest first, including hidden ones (for the admin). */
export async function getAllPosts(opts: { fresh?: boolean } = {}): Promise<BlogPost[]> {
  const store = await load(Boolean(opts.fresh)).catch(() => ({ overrides: {}, own: [] }) as BlogStore);
  const auto = (bundled as BlogPost[]).map((p) => {
    const o = store.overrides[p.slug];
    return o ? { ...p, ...o, source: "auto" as const, edited: true } : { ...p, source: "auto" as const };
  });
  const ownSlugs = new Set(store.own.map((p) => p.slug));
  return [...store.own, ...auto.filter((p) => !ownSlugs.has(p.slug))].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const today = new Date().toISOString().slice(0, 10);
  return (await getAllPosts()).filter((p) => !p.hidden && p.date <= today);
}

export async function getPost(slug: string, opts: { fresh?: boolean } = {}): Promise<BlogPost | undefined> {
  return (await getAllPosts(opts)).find((p) => p.slug === slug);
}

export async function savePost(slug: string | null, input: Omit<BlogPost, "slug" | "source" | "edited">): Promise<BlogPost> {
  const store = await load(true);
  const all = await getAllPosts({ fresh: true });
  const existing = slug ? all.find((p) => p.slug === slug) : undefined;

  if (existing?.source === "auto") {
    store.overrides[existing.slug] = {
      title: input.title,
      summary: input.summary,
      category: input.category,
      body: input.body,
      hidden: input.hidden,
    };
    await writeJSON(KEY, store);
    return { ...existing, ...input, edited: true };
  }

  let newSlug = existing?.slug;
  if (!newSlug) {
    const base =
      input.title
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "post";
    newSlug = base;
    let n = 2;
    while (all.some((p) => p.slug === newSlug)) newSlug = `${base}-${n++}`;
  }
  const post: BlogPost = { ...input, slug: newSlug, source: "own" };
  store.own = existing ? store.own.map((p) => (p.slug === newSlug ? post : p)) : [post, ...store.own];
  await writeJSON(KEY, store);
  return post;
}

/** Heleen's own posts are deleted; scheduled posts are hidden (they live in the code). */
export async function removePost(slug: string): Promise<void> {
  const store = await load(true);
  if (store.own.some((p) => p.slug === slug)) {
    store.own = store.own.filter((p) => p.slug !== slug);
  } else {
    store.overrides[slug] = { ...(store.overrides[slug] ?? {}), hidden: true };
  }
  await writeJSON(KEY, store);
}

export function formatDate(d: string): string {
  const date = new Date(`${d}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

export function readingTime(md: string): string {
  const words = md.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
