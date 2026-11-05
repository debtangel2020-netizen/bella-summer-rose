"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/types";
import { rand } from "@/lib/money";

const LABEL: Record<Order["status"], string> = {
  pending: "Awaiting payment",
  paid: "Paid · to post",
  shipped: "Posted",
  cancelled: "Cancelled",
};

export function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [tracking, setTracking] = useState(order.tracking ?? "");
  const [busy, setBusy] = useState(false);
  const a = order.address;
  const date = new Date(order.paidAt ?? order.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });

  async function update(status: Order["status"]) {
    setBusy(true);
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tracking }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <article className="order-card">
      <div className="top">
        <strong style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.3rem" }}>{order.customer.name}</strong>
        <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="label">#{order.id.slice(0, 8).toUpperCase()} · {date}</span>
          <span className={`pill ${order.status}`}>{LABEL[order.status]}</span>
        </span>
      </div>
      <div className="cols">
        <div>
          <p className="label" style={{ marginBottom: 6 }}>Items</p>
          {order.items.map((i) => <p key={i.productId}>{i.qty} × {i.name} — {rand(i.price * i.qty)}</p>)}
          <p style={{ color: "var(--muted)" }}>Delivery {order.shipping ? rand(order.shipping) : "free"}</p>
          <p><strong>Total {rand(order.total)}</strong></p>
        </div>
        <div>
          <p className="label" style={{ marginBottom: 6 }}>Post to</p>
          <p className="copyable" style={{ whiteSpace: "pre-line" }}>
            {[order.customer.name, a.line1, a.line2, a.city, [a.province, a.postalCode].filter(Boolean).join(" "), a.country].filter(Boolean).join("\n")}
          </p>
        </div>
        <div>
          <p className="label" style={{ marginBottom: 6 }}>Contact</p>
          <p className="copyable">{order.customer.email}</p>
          <p className="copyable">{order.customer.phone}</p>
          {order.note && <p style={{ marginTop: 8 }}><em>“{order.note}”</em></p>}
        </div>
      </div>
      {(order.status === "paid" || order.status === "shipped") && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "end" }}>
          <label className="field" style={{ flex: "1 1 240px" }}>
            <span>Tracking number or note</span>
            <input id={`tracking-${order.id}`} value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. PostNet / Courier Guy waybill" />
          </label>
          {order.status === "paid" ? (
            <button className="btn small" type="button" disabled={busy} onClick={() => update("shipped")}>Mark as posted</button>
          ) : (
            <button className="btn ghost small" type="button" disabled={busy} onClick={() => update("shipped")}>Save tracking</button>
          )}
        </div>
      )}
      {order.status === "pending" && (
        <div><button className="btn ghost small" type="button" disabled={busy} onClick={() => update("cancelled")}>Mark as abandoned</button></div>
      )}
    </article>
  );
}
