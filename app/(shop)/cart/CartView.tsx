"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { rand, shippingFor } from "@/lib/money";
import { countryNames } from "@/lib/countries";

type Shipping = { domesticShipping: number; freeDomesticOver: number; internationalShipping: number };

export function CartView({ shipping, message }: { shipping: Shipping; message: string | null }) {
  const { lines, ready, setQty, remove } = useCart();
  const countries = useMemo(() => countryNames(), []);
  const [country, setCountry] = useState("South Africa");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const ship = lines.length ? shippingFor(country, subtotal, shipping) : 0;
  const total = subtotal + ship;
  const isSA = country === "South Africa";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
          customer: { name: get("name"), email: get("email"), phone: get("phone") },
          address: {
            line1: get("line1"),
            line2: get("line2"),
            city: get("city"),
            province: get("province"),
            postalCode: get("postalCode"),
            country,
          },
          note: get("note"),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirectUrl) throw new Error(data.error || "Something went wrong. Please try again.");
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (!ready) return <div className="page-title"><h1>Your cart</h1></div>;

  if (lines.length === 0) {
    return (
      <>
        <div className="page-title"><h1>Your cart</h1></div>
        {message && <p className="notice" style={{ marginBottom: 20 }}>{message}</p>}
        <div className="empty-state" style={{ marginTop: 24 }}>
          <h3>Your cart is empty</h3>
          <p>Have a look through the collection and add something you love.</p>
          <Link href="/shop" className="btn" style={{ marginTop: 8 }}>Browse the shop</Link>
        </div>
      </>
    );
  }

  return (
    <div className="cart-layout">
      <section>
        <h1>Your cart</h1>
        {message && <p className="notice" style={{ marginBottom: 20 }}>{message}</p>}
        <div className="cart-items">
          {lines.map((l) => (
            <div className="cart-item" key={l.key}>
              {l.image ? <img src={l.image} alt="" /> : <div className="noimg" />}
              <div className="info">
                <Link href={`/product/${l.slug}`} style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", textDecoration: "none" }}>
                  {l.name}
                </Link>
                {l.variant && (
                  <span className="cart-variant">
                    Colour: <strong>{l.variant}</strong>
                    {l.madeToOrder ? ` · made to order, ready in ${l.makingTime ?? "about 2 weeks"}` : " · in stock"}
                  </span>
                )}
                {l.maxQty > 1 ? (
                  <div className="qty" role="group" aria-label={`Quantity of ${l.name}`} style={{ justifySelf: "start" }}>
                    <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="One fewer">−</button>
                    <output>{l.qty}</output>
                    <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="One more">+</button>
                  </div>
                ) : (
                  <span className="label">{l.madeToOrder ? "Qty 1" : "One of a kind"}</span>
                )}
                <button type="button" className="linkbtn" onClick={() => remove(l.key)}>Remove</button>
              </div>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{rand(l.price * l.qty)}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16 }}><Link href="/shop">← Keep shopping</Link></p>
      </section>

      <form className="panel" onSubmit={onSubmit}>
        <h2>Delivery details</h2>
        <div className="form-grid">
          <label className="field full"><span>Full name</span><input id="name" name="name" required autoComplete="name" /></label>
          <label className="field"><span>Email</span><input id="email" name="email" type="email" required autoComplete="email" /></label>
          <label className="field"><span>Phone</span><input id="phone" name="phone" type="tel" required autoComplete="tel" /></label>
          <label className="field full">
            <span>Country</span>
            <select id="country" name="country" value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country-name">
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="field full"><span>Street address</span><input id="line1" name="line1" required autoComplete="address-line1" /></label>
          <label className="field full"><span>Apartment, complex, unit (optional)</span><input id="line2" name="line2" autoComplete="address-line2" /></label>
          <label className="field"><span>City or town</span><input id="city" name="city" required autoComplete="address-level2" /></label>
          <label className="field"><span>{isSA ? "Province" : "State or region"}</span><input id="province" name="province" autoComplete="address-level1" /></label>
          <label className="field"><span>Postal code</span><input id="postalCode" name="postalCode" required autoComplete="postal-code" /></label>
          <label className="field full"><span>Note for Heleen (optional)</span><textarea id="note" name="note" rows={2} style={{ minHeight: 70 }} placeholder="A gift message, colour question, or delivery note" /></label>
        </div>

        <div className="totals">
          <div><span>Items</span><span>{rand(subtotal)}</span></div>
          <div><span>Delivery to {country}</span><span>{ship === 0 ? "Free" : rand(ship)}</span></div>
          <div className="grand"><span>Total</span><span>{rand(total)}</span></div>
        </div>
        {!isSA && <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>You pay in South African Rand. Your bank converts it to your currency. Import duties may apply in your country.</p>}
        {error && <p className="error-text" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? "Opening secure payment…" : `Pay ${rand(total)} securely`}</button>
        <p className="label" style={{ textAlign: "center" }}>Card payment by Yoco</p>
      </form>
    </div>
  );
}
