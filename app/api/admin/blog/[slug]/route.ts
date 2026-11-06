import { requireAdmin } from "@/lib/auth";
import { getPost, removePost, savePost } from "@/lib/blog";
import { parsePostInput } from "@/lib/postInput";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { slug } = await params;
  const existing = await getPost(slug, { fresh: true });
  if (!existing) return Response.json({ error: "Post not found." }, { status: 404 });
  const parsed = parsePostInput(await req.json().catch(() => ({})));
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
  if (existing.source === "auto") parsed.value.date = existing.date;
  const post = await savePost(slug, parsed.value);
  return Response.json({ post });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { slug } = await params;
  await removePost(slug);
  return Response.json({ ok: true });
}
