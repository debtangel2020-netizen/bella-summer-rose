import Link from "next/link";
import type { Product } from "@/lib/types";
import { rand } from "@/lib/money";
import { hasVariants, inStockCount, isAvailable } from "@/lib/variants";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images[0];
  return (
    <Link href={`/product/${product.slug}`} className="card">
      <div className="ph">
        {img ? <img src={img} alt={product.name} loading="lazy" /> : null}
        {!isAvailable(product) ? (
          <span className="badge sold">Sold out</span>
        ) : hasVariants(product) ? (
          product.variants.length > 1 ? <span className="badge">{product.variants.length} colours</span> : null
        ) : inStockCount(product) === 1 ? (
          <span className="badge">One of a kind</span>
        ) : null}
      </div>
      <div className="meta">
        <h3>{product.name}</h3>
        <span className="price">{rand(product.price)}</span>
      </div>
      {product.category && <span className="label">{product.category}</span>}
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
