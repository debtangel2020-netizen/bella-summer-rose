import { randomUUID } from "crypto";
import { getProducts, getSettings, saveOrder } from "@/lib/store";
import { shippingFor } from "@/lib/money";
import { createCheckout } from "@/lib/yoco";
import type { Order, OrderItem } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  items: { productId: string; qty: number }[];
  customer: { name: string; email: string; phone: string };
  address: Order["address"];
  note?: string;
};

const clip = (s: unknown, n = 200) => String(s ?? "").trim().slice(0, n);

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const customer = { name: clip(body.customer?.name), email: clip(body.customer?.email), phone: clip(body.customer?.phone, 40) };
  const address = {
    line1: clip(body.address?.line1),
    line2: clip(body.address?.line2),
    city: clip(body.address?.city, 100),
    province: clip(body.address?.province, 100),
    postalCode: clip(body.address?.postalCode, 20),
    country: clip(body.address?.country, 80) || "South Africa",
  };
  if (!customer.name || !/^\S+@\S+\.\S+$/.test(customer.email) || !customer.phone) {
    return Response.json({ error: "Please fill in your name, a valid email and a phone number." }, { status: 400 });
  }
  if (!address.line1 || !address.city || !address.postalCode) {
    return Response.json({ error: "Please fill in your full delivery address." }, { status: 400 });
  }

  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const items: OrderItem[] = [];
  for (const line of body.items ?? []) {
    const p = products.find((x) => x.id === line.productId && x.published);
    const qty = Math.floor(Number(line.qty));
    if (!p) return Response.json({ error: "One of the items in your cart is no longer available. Please remove it and try again." }, { status: 409 });
    if (!(qty > 0)) continue;
    if (p.stock < qty) {
      return Response.json(
        { error: p.stock <= 0 ? `Sorry, "${p.name}" has just sold out. Please remove it from your cart.` : `Only ${p.stock} of "${p.name}" left. Please lower the quantity.` },
        { status: 409 }
      );
    }
    items.push({ productId: p.id, name: p.name, price: p.price, qty, image: p.images[0] ?? null });
  }
  if (items.length === 0) return Response.json({ error: "Your cart is empty." }, { status: 400 });

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const shipping = shippingFor(address.country, subtotal, settings);
  const order: Order = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    customer,
    address,
    note: clip(body.note, 500),
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
  };

  const origin = process.env.SITE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
  try {
    await saveOrder(order);
    const checkout = await createCheckout({
      amount: order.total,
      successUrl: `${origin}/checkout/success?order=${order.id}`,
      cancelUrl: `${origin}/cart?cancelled=1`,
      failureUrl: `${origin}/cart?failed=1`,
      metadata: { orderId: order.id, customerName: customer.name },
      idempotencyKey: order.id,
    });
    order.checkoutId = checkout.id;
    await saveOrder(order);
    return Response.json({ redirectUrl: checkout.redirectUrl });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "The payment page could not be opened. Please try again." },
      { status: 502 }
    );
  }
}
