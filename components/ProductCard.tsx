import Link from "next/link";
import type { Product } from "@/lib/types";
import { rand } from "@/lib/money";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images[0];
  return (
    <Link href={`/product/${product.slug}`} className="card">
      <div className="ph">
        {img ? <img src={img} alt={product.name} loading="lazy" /> : null}
        {product.stock <= 0 ? (
          <span className="badge sold">Sold out</span>
        ) : product.stock === 1 ? (
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
