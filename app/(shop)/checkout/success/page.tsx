import Link from "next/link";
import type { Metadata } from "next";
import { getOrder } from "@/lib/store";
import { rand } from "@/lib/money";
import { ClearCart } from "./ClearCart";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: id } = await searchParams;
  const order = id ? await getOrder(id) : undefined;
  const firstName = order?.customer.name.split(" ")[0];

  return (
    <div className="wrap" style={{ maxWidth: 720 }}>
      <ClearCart />
      <div className="page-title">
        <p className="label" style={{ color: "var(--rose)", marginBottom: 12 }}>Order received</p>
        <h1>Thank you{firstName ? `, ${firstName}` : ""}.</h1>
        <p>
          Your payment went through and your order is with Heleen. You will hear from her at{" "}
          {order ? <strong>{order.customer.email}</strong> : "your email address"} when it is posted.
        </p>
      </div>
      {order && (
        <div className="panel" style={{ marginTop: 24 }}>
          <span className="label">Order {order.id.slice(0, 8).toUpperCase()}</span>
          <div className="totals">
            {order.items.map((i) => (
              <div key={i.productId}><span>{i.qty} × {i.name}</span><span>{rand(i.price * i.qty)}</span></div>
            ))}
            <div><span>Delivery to {order.address.country}</span><span>{order.shipping ? rand(order.shipping) : "Free"}</span></div>
            <div className="grand"><span>Paid</span><span>{rand(order.total)}</span></div>
          </div>
        </div>
      )}
      <p style={{ marginTop: 28 }}><Link href="/shop" className="btn ghost">Back to the shop</Link></p>
    </div>
  );
}
