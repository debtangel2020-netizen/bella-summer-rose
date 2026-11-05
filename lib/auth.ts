import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "bsr_admin";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function key(): Buffer {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD is not set. Add it in Vercel > Settings > Environment Variables.");
  return crypto
    .createHash("sha256")
    .update(`bsr:${pw}:${process.env.SESSION_SECRET ?? ""}`)
    .digest();
}

function sign(value: string): string {
  return crypto.createHmac("sha256", key()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return safeEqual(input, pw);
}

export function makeSessionToken(): { value: string; expires: Date } {
  const exp = Date.now() + THIRTY_DAYS;
  return { value: `${exp}.${sign(String(exp))}`, expires: new Date(exp) };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  try {
    return safeEqual(sig, sign(exp));
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

/** For API routes: returns a 401 Response if not logged in, otherwise null. */
export async function requireAdmin(): Promise<Response | null> {
  if (await isAdmin()) return null;
  return Response.json({ error: "Please log in again." }, { status: 401 });
}
