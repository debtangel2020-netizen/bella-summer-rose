import { getOrders } from "@/lib/store";
import { OrderCard } from "./OrderCard";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const { all } = await searchParams;
  const orders = await getOrders();
  const shown = all ? orders : orders.filter((o) => o.status !== "pending" && o.status !== "cancelled");
  const hidden = orders.length - shown.length;

  return (
    <>
      <h1>Orders</h1>
      <p style={{ color: "var(--muted)", marginBottom: 20, maxWidth: "62ch" }}>
        Paid orders appear here as soon as Yoco confirms the payment. Pack them, post them, then mark them as posted.
        {hidden > 0 && !all && <> {" "}<a href="/admin/orders?all=1">Show {hidden} unpaid or abandoned checkouts</a></>}
      </p>
      {shown.length === 0 ? (
        <div className="empty-state"><h3>No orders yet</h3><p>When someone buys something, it will show up here.</p></div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {shown.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </>
  );
}
