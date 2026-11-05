import { requireAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No photo received." }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ error: "Please upload a photo (JPG or PNG)." }, { status: 400 });
  try {
    const url = await uploadImage(file);
    return Response.json({ url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 500 });
  }
}
