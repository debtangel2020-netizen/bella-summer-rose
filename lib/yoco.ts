import "server-only";
import crypto from "crypto";

const API = "https://payments.yoco.com/api";

function secretKey(): string {
  const k = process.env.YOCO_SECRET_KEY;
  if (!k) throw new Error("YOCO_SECRET_KEY is not set.");
  return k;
}

export async function createCheckout(opts: {
  amount: number; // cents
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
}): Promise<{ id: string; redirectUrl: string }> {
  const res = await fetch(`${API}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      "Idempotency-Key": opts.idempotencyKey,
    },
    body: JSON.stringify({
      amount: opts.amount,
      currency: "ZAR",
      successUrl: opts.successUrl,
      cancelUrl: opts.cancelUrl,
      failureUrl: opts.failureUrl,
      metadata: opts.metadata,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.redirectUrl) {
    console.error("Yoco checkout failed", res.status, data);
    throw new Error("The payment page could not be opened. Please try again in a moment.");
  }
  return { id: data.id, redirectUrl: data.redirectUrl };
}

export async function registerWebhook(url: string): Promise<{ id: string; secret: string }> {
  const res = await fetch(`${API}/webhooks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "bella-summer-rose-orders", url }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.secret) {
    console.error("Yoco webhook registration failed", res.status, data);
    throw new Error(data?.description || data?.message || `Yoco returned ${res.status}`);
  }
  return { id: data.id, secret: data.secret };
}

/** Verifies Yoco's webhook signature (webhook-id / webhook-timestamp / webhook-signature headers). */
export function verifyWebhook(rawBody: string, headers: Headers): boolean {
  const secret = process.env.YOCO_WEBHOOK_SECRET;
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!secret || !id || !timestamp || !signatureHeader) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 5 * 60) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest("base64");

  return signatureHeader.split(" ").some((part) => {
    const sig = part.includes(",") ? part.split(",")[1] : part;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}
