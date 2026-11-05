import Link from "next/link";
import { getPublishedProducts, getSettings } from "@/lib/store";
import { ProductGrid } from "@/components/ProductCard";
import { rand } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, settings] = await Promise.all([getPublishedProducts(), getSettings()]);
  const featured = products.filter((p) => p.featured);
  const showcase = (featured.length ? featured : products).slice(0, 6);
  const heroProduct = showcase.find((p) => p.images.length > 0);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <p className="label" style={{ color: "var(--rose)" }}>Knitted by hand by Heleen Rose</p>
            <h1 style={{ marginTop: 14 }}>
              Made slowly, <em>stitch by stitch,</em> to be kept.
            </h1>
            <p className="lede">{settings.tagline} Each piece is knitted in South Africa and posted to you anywhere in the world.</p>
            <div className="actions">
              <Link href="/shop" className="btn">Shop the collection</Link>
              <Link href="/#about" className="btn ghost">Meet the maker</Link>
            </div>
          </div>
          {heroProduct ? (
            <Link href={`/product/${heroProduct.slug}`} className="hero-art">
              <img src={heroProduct.images[0]} alt={heroProduct.name} />
              <span className="tag">{heroProduct.name} · {rand(heroProduct.price)}</span>
            </Link>
          ) : (
            <div className="hero-art empty" aria-hidden="true"><div className="yarn" /></div>
          )}
        </div>
      </section>

      <div className="stitch" aria-hidden="true" />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>{featured.length ? "Featured pieces" : "Fresh off the needles"}</h2>
            {products.length > showcase.length && <Link href="/shop">See all {products.length} pieces →</Link>}
          </div>
          {showcase.length ? (
            <ProductGrid products={showcase} />
          ) : (
            <div className="empty-state">
              <h3>New pieces are on the needles</h3>
              <p>The first collection is being finished now. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head"><h2>How each piece is made</h2></div>
          <ol className="process">
            <li><h3>Choosing the yarn</h3><p>Soft, hard-wearing fibres picked for how they feel against skin and how they wash.</p></li>
            <li><h3>Casting on</h3><p>Every piece starts as a single row of loops on the needle, knitted by hand.</p></li>
            <li><h3>Knitting it up</h3><p>Hours of stitches, row by row. Larger pieces can take days.</p></li>
            <li><h3>Blocking and finishing</h3><p>Washed, shaped and dried flat, ends woven in, then wrapped for posting.</p></li>
          </ol>
        </div>
      </section>

      <section className="section" id="about">
        <div className="wrap about">
          <div>
            <p className="label" style={{ marginBottom: 12 }}>About</p>
            <h2>The hands behind the stitches</h2>
          </div>
          <p>{settings.about}</p>
        </div>
      </section>

      <section className="section" id="delivery">
        <div className="wrap">
          <div className="section-head"><h2>Delivery</h2></div>
          <div className="ship-strip">
            <div>
              <span className="label">South Africa</span>
              <strong>{rand(settings.domesticShipping)}</strong>
              <span>{settings.freeDomesticOver > 0 ? `Free on orders over ${rand(settings.freeDomesticOver)}` : "Tracked courier to your door"}</span>
            </div>
            <div>
              <span className="label">Rest of the world</span>
              <strong>{rand(settings.internationalShipping)}</strong>
              <span>Tracked international post</span>
            </div>
            <div>
              <span className="label">Payment</span>
              <strong>Card, via Yoco</strong>
              <span>Secure checkout in South African Rand</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
