"use client";

import { useState } from "react";
import Link from "next/link";
import { lineKey, useCart } from "./CartProvider";
import { availableQty, findVariant, hasVariants, isAvailable, makingTimeText, variantLabel } from "@/lib/variants";
import type { Product } from "@/lib/types";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) return <div className="gallery"><div className="main" /></div>;
  return (
    <div className="gallery">
      <div className="main">
        <img src={images[i]} alt={`${name}, photo ${i + 1} of ${images.length}`} />
      </div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((src, idx) => (
            <button key={src} type="button" aria-pressed={idx === i} aria-label={`Show photo ${idx + 1}`} onClick={() => setI(idx)}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { add, lines } = useCart();
  const colours = product.variants ?? [];
  const firstAvailable = colours.find((v) => v.mode === "order" || v.stock > 0);
  const [variantId, setVariantId] = useState<string>(firstAvailable?.id ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = findVariant(product, variantId);
  const max = availableQty(product, variantId);
  const inCart = lines.find((l) => l.key === lineKey(product.id, variant?.id))?.qty ?? 0;
  const available = Math.max(0, max - inCart);

  if (!isAvailable(product)) {
    return <p className="notice">This piece has sold out. Get in touch if you would like one made for you.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {hasVariants(product) && (
        <label className="field" style={{ maxWidth: 420 }}>
          <span>Colour</span>
          <select
            id="colour"
            value={variantId}
            onChange={(e) => {
              setVariantId(e.target.value);
              setQty(1);
              setAdded(false);
            }}
          >
            {colours.map((v) => (
              <option key={v.id} value={v.id} disabled={v.mode === "stock" && v.stock <= 0}>
                {variantLabel(product, v)}
              </option>
            ))}
          </select>
          {variant?.mode === "order" ? (
            <small className="made-to-order">Made to order: Heleen knits this one for you. Ready to post in {makingTimeText(product)}.</small>
          ) : variant ? (
            <small className="ready-now">In stock: ready to post now.</small>
          ) : null}
        </label>
      )}
      <div className="buy-row">
        {max > 1 && (
          <div className="qty" role="group" aria-label="Quantity">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One fewer">−</button>
            <output aria-live="polite">{qty}</output>
            <button type="button" onClick={() => setQty((q) => Math.min(Math.max(1, available), q + 1))} aria-label="One more">+</button>
          </div>
        )}
        <button
          type="button"
          className="btn"
          disabled={available <= 0 || (hasVariants(product) && !variant)}
          onClick={() => {
            add(
              {
                productId: product.id,
                variantId: variant?.id,
                variant: variant?.name,
                madeToOrder: variant?.mode === "order",
                makingTime: variant?.mode === "order" ? makingTimeText(product) : undefined,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0] ?? null,
                maxQty: max,
              },
              Math.min(qty, available)
            );
            setAdded(true);
            setQty(1);
          }}
        >
          {available <= 0 ? "All available are in your cart" : "Add to cart"}
        </button>
      </div>
      {added && (
        <p className="notice" role="status">
          Added to your cart{variant ? ` (${variant.name})` : ""}. <Link href="/cart">Go to checkout</Link>
        </p>
      )}
    </div>
  );
}
