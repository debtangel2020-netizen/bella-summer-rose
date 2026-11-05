import { requireAdmin } from "@/lib/auth";
import { registerWebhook } from "@/lib/yoco";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const origin = process.env.SITE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
  if (origin.includes("localhost")) {
    return Response.json({ error: "Connect Yoco from the live website, not from your own computer." }, { status: 400 });
  }
  try {
    const hook = await registerWebhook(`${origin}/api/webhooks/yoco`);
    return Response.json({ secret: hook.secret });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Could not connect to Yoco." }, { status: 502 });
  }
}
