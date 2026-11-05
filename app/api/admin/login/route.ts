import { cookies } from "next/headers";
import { ADMIN_COOKIE, checkPassword, makeSessionToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "No admin password has been set up yet. Add ADMIN_PASSWORD in Vercel." }, { status: 500 });
  }
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  await new Promise((r) => setTimeout(r, 400)); // slow down guessing
  if (!password || !checkPassword(password)) {
    return Response.json({ error: "That password is not right. Please try again." }, { status: 401 });
  }
  const token = makeSessionToken();
  (await cookies()).set(ADMIN_COOKIE, token.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: token.expires,
  });
  return Response.json({ ok: true });
}
