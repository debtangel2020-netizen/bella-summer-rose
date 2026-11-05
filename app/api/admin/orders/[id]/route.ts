import { requireAdmin } from "@/lib/auth";
import { getOrder, saveOrder } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";

export const runtime = "nodejs";

const ALLOWED: OrderStatus[] = ["shipped", "cancelled"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as { status?: OrderStatus; tracking?: string };
  if (body.status && ALLOWED.includes(body.status)) {
    if (body.status === "shipped" && order.status === "pending") {
      return Response.json({ error: "This order has not been paid." }, { status: 400 });
    }
    order.status = body.status;
  }
  if (typeof body.tracking === "string") order.tracking = body.tracking.trim().slice(0, 200);
  await saveOrder(order);
  return Response.json({ order });
}
