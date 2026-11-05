"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
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
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = lines.find((l) => l.productId === product.id)?.qty ?? 0;
  const available = Math.max(0, product.stock - inCart);

  if (product.stock <= 0) {
    return <p className="notice">This piece has sold out. Get in touch if you would like one made for you.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="buy-row">
        {product.stock > 1 && (
          <div className="qty" role="group" aria-label="Quantity">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One fewer">−</button>
            <output aria-live="polite">{qty}</output>
            <button type="button" onClick={() => setQty((q) => Math.min(Math.max(1, available), q + 1))} aria-label="One more">+</button>
          </div>
        )}
        <button
          type="button"
          className="btn"
          disabled={available <= 0}
          onClick={() => {
            add(
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0] ?? null,
                maxQty: product.stock,
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
          Added to your cart. <Link href="/cart">Go to checkout</Link>
        </p>
      )}
    </div>
  );
}
