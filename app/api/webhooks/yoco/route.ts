import { verifyWebhook } from "@/lib/yoco";
import { adjustStock, getOrder, getOrders, saveOrder } from "@/lib/store";

export const runtime = "nodejs";

type YocoEvent = {
  id: string;
  type: string;
  payload?: {
    id?: string;
    amount?: number;
    status?: string;
    metadata?: Record<string, string>;
  };
};

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers)) {
    return new Response("Invalid signature", { status: 403 });
  }

  const event = JSON.parse(raw) as YocoEvent;
  if (event.type !== "payment.succeeded" || !event.payload) {
    return new Response("ignored", { status: 200 });
  }

  const meta = event.payload.metadata ?? {};
  let order = meta.orderId ? await getOrder(meta.orderId) : undefined;
  if (!order && meta.checkoutId) {
    order = (await getOrders()).find((o) => o.checkoutId === meta.checkoutId);
  }
  if (!order) {
    console.error("Yoco payment for unknown order", event.payload.id, meta);
    return new Response("order not found", { status: 200 });
  }
  if (order.status !== "pending") return new Response("already processed", { status: 200 });

  if (typeof event.payload.amount === "number" && event.payload.amount !== order.total) {
    console.error("Amount mismatch", order.id, event.payload.amount, order.total);
  }

  order.status = "paid";
  order.paymentId = event.payload.id;
  order.paidAt = new Date().toISOString();
  await saveOrder(order);
  await adjustStock(order.items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })));

  return new Response("ok", { status: 200 });
}
