"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  productId: string;
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
  add: (line: Omit<CartLine, "qty">, qty: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "bsr-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
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

  const add = useCallback((line: Omit<CartLine, "qty">, qty: number) => {
    setLines((prev) => {
      const found = prev.find((l) => l.productId === line.productId);
      if (found) {
        return prev.map((l) =>
          l.productId === line.productId ? { ...l, ...line, qty: Math.min(line.maxQty, l.qty + qty) } : l
        );
      }
      return [...prev, { ...line, qty: Math.min(line.maxQty, qty) }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, qty: Math.max(1, Math.min(l.maxQty, qty)) } : l))
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
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
