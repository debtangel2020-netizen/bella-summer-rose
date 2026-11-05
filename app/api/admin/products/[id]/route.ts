import { requireAdmin } from "@/lib/auth";
import { deleteImage, deleteProduct, getProduct, saveProduct } from "@/lib/store";
import { parseProductInput } from "@/lib/productInput";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const existing = await getProduct(id);
  if (!existing) return Response.json({ error: "Product not found." }, { status: 404 });
  const parsed = parseProductInput(await req.json());
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
  const product = await saveProduct({ ...parsed.value, id });
  const removed = existing.images.filter((url) => !product.images.includes(url));
  await Promise.all(removed.map(deleteImage));
  return Response.json({ product });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const existing = await getProduct(id);
  if (!existing) return Response.json({ ok: true });
  await deleteProduct(id);
  await Promise.all(existing.images.map(deleteImage));
  return Response.json({ ok: true });
}
