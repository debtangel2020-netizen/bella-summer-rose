import { requireAdmin } from "@/lib/auth";
import { savePost } from "@/lib/blog";
import { parsePostInput } from "@/lib/postInput";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = parsePostInput(await req.json().catch(() => ({})));
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
  const post = await savePost(null, parsed.value);
  return Response.json({ post });
}
