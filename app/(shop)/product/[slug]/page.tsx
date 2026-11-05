import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/store";
import { rand } from "@/lib/money";
import { AddToCart, Gallery } from "@/components/ProductBuy";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Not found" };
  return {
    title: p.name,
    description: p.description.slice(0, 160),
    openGraph: { images: p.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.published) notFound();

  const stockText =
    product.stock <= 0 ? "Sold out" : product.stock === 1 ? "Only one made" : product.stock <= 3 ? `Only ${product.stock} left` : "In stock";
  const stockClass = product.stock <= 0 ? "out" : product.stock <= 3 ? "low" : "in";

  const specs: [string, string][] = [
    ["Yarn & fibre", product.materials],
    ["Size", product.size],
    ["Care", product.care],
    ["Hours on the needles", product.hours ? `About ${product.hours} hours of hand-knitting` : ""],
  ].filter((s): s is [string, string] => Boolean(s[1]));

  return (
    <div className="wrap">
      <p style={{ paddingTop: 24 }}>
        <Link href="/shop" className="label" style={{ textDecoration: "none" }}>← Back to the collection</Link>
      </p>
      <div className="product">
        <Gallery images={product.images} name={product.name} />
        <div className="buybox">
          {product.category && <span className="label">{product.category}</span>}
          <h1>{product.name}</h1>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <span className="price">{rand(product.price)}</span>
            <span className={`stock ${stockClass}`}>{stockText}</span>
          </div>
          {product.description && <p className="desc">{product.description}</p>}
          <AddToCart product={product} />
          {specs.length > 0 && (
            <dl className="specs">
              {specs.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
