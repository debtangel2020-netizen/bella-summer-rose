import type { BlogPost } from "./blog";

export function parsePostInput(raw: Record<string, unknown>):
  | { ok: true; value: Omit<BlogPost, "slug" | "source" | "edited"> }
  | { ok: false; error: string } {
  const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  const title = s(raw.title, 160);
  const body = s(raw.body, 20000);
  if (!title) return { ok: false, error: "Please give the post a title." };
  if (!body) return { ok: false, error: "The post is empty." };
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(raw.date)) ? String(raw.date) : new Date().toISOString().slice(0, 10);
  return {
    ok: true,
    value: { title, body, date, summary: s(raw.summary, 300), category: s(raw.category, 40), hidden: Boolean(raw.hidden) },
  };
}
