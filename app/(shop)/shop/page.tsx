import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedProducts } from "@/lib/store";
import { ProductGrid } from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const products = await getPublishedProducts();
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
  const shown = c ? products.filter((p) => p.category === c) : products;
  const inStockFirst = [...shown].sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));

  return (
    <div className="wrap">
      <div className="page-title">
        <h1>The collection</h1>
        <p>Every piece is hand-knitted in small numbers. When something sells out, it may come back in a new colour.</p>
      </div>
      {categories.length > 1 && (
        <nav className="chips" aria-label="Categories" style={{ marginTop: 20 }}>
          <Link href="/shop" className="chip" aria-current={!c ? "page" : undefined}>All</Link>
          {categories.map((cat) => (
            <Link key={cat} href={`/shop?c=${encodeURIComponent(cat)}`} className="chip" aria-current={c === cat ? "page" : undefined}>
              {cat}
            </Link>
          ))}
        </nav>
      )}
      <div style={{ marginTop: 28 }}>
        {inStockFirst.length ? (
          <ProductGrid products={inStockFirst} />
        ) : (
          <div className="empty-state">
            <h3>Nothing here yet</h3>
            <p>New pieces are being knitted. Please check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
