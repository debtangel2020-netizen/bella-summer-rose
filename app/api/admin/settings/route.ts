import { requireAdmin } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/store";
import { toCents } from "@/lib/money";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const current = await getSettings();
  const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  await saveSettings({
    tagline: s(b.tagline, 200) || current.tagline,
    about: s(b.about, 3000) || current.about,
    shopEmail: s(b.shopEmail, 120),
    whatsapp: s(b.whatsapp, 40),
    instagram: s(b.instagram, 60),
    domesticShipping: toCents(b.domesticShipping ?? 0),
    freeDomesticOver: toCents(b.freeDomesticOver ?? 0),
    internationalShipping: toCents(b.internationalShipping ?? 0),
  });
  return Response.json({ ok: true });
}
