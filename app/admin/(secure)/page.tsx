import Link from "next/link";
import { getProducts } from "@/lib/store";
import { rand } from "@/lib/money";

export default async function AdminProducts() {
  const products = await getProducts({ fresh: true });
  return (
    <>
      <div className="section-head" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Products</h1>
        <Link href="/admin/products/new" className="btn">+ Add a product</Link>
      </div>
      {products.length === 0 ? (
        <div className="empty-state">
          <h3>No products yet</h3>
          <p>Add your first piece: take a few photos, give it a name and a price, and it appears in the shop.</p>
          <Link href="/admin/products/new" className="btn" style={{ marginTop: 8 }}>Add your first product</Link>
        </div>
      ) : (
        <div className="admin-list">
          {products.map((p) => (
            <Link key={p.id} href={`/admin/products/${p.id}`} className="admin-row">
              {p.images[0] ? <img src={p.images[0]} alt="" /> : <div className="noimg" />}
              <div className="info">
                <strong>{p.name}</strong>
                <div className="sub">
                  <span>{rand(p.price)}</span>
                  <span>
                    {p.variants?.length
                      ? `${p.variants.length} colour${p.variants.length > 1 ? "s" : ""} · ${p.variants.filter((v) => v.mode === "stock").reduce((n, v) => n + v.stock, 0)} in stock${p.variants.some((v) => v.mode === "order") ? " · made to order available" : ""}`
                      : p.stock <= 0
                      ? "Sold out"
                      : `${p.stock} in stock`}
                  </span>
                  {p.category && <span>{p.category}</span>}
                </div>
              </div>
              <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                {!p.published && <span className="pill draft">Hidden</span>}
                {p.featured && <span className="pill shipped">Featured</span>}
                <span className="label">Edit →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
