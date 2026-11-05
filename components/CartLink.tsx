"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="cart-link" aria-label={`Cart, ${count} items`}>
      Cart
      {ready && count > 0 && <span className="cart-count">{count}</span>}
    </Link>
  );
}
