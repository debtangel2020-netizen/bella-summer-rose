import { requireAdmin } from "@/lib/auth";
import { saveProduct } from "@/lib/store";
import { parseProductInput } from "@/lib/productInput";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = parseProductInput(await req.json());
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
  const product = await saveProduct(parsed.value);
  return Response.json({ product });
}
