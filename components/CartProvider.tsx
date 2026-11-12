"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  /** Unique per product + colour */
  key: string;
  productId: string;
  variantId?: string;
  variant?: string;
  madeToOrder?: boolean;
  makingTime?: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
  maxQty: number;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (line: Omit<CartLine, "qty" | "key">, qty: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "bsr-cart-v1";
export const lineKey = (productId: string, variantId?: string) => (variantId ? `${productId}:${variantId}` : productId);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as CartLine[];
        setLines(saved.map((l) => ({ ...l, key: l.key ?? lineKey(l.productId, l.variantId) })));
      }
    } catch {
      /* storage unavailable */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines, ready]);

  const add = useCallback((line: Omit<CartLine, "qty" | "key">, qty: number) => {
    const key = lineKey(line.productId, line.variantId);
    setLines((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) {
        return prev.map((l) => (l.key === key ? { ...l, ...line, qty: Math.min(line.maxQty, l.qty + qty) } : l));
      }
      return [...prev, { ...line, key, qty: Math.min(line.maxQty, qty) }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(l.maxQty, qty)) } : l)));
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({ lines, count: lines.reduce((n, l) => n + l.qty, 0), ready, add, setQty, remove, clear }),
    [lines, ready, add, setQty, remove, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
