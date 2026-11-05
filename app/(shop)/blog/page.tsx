import Link from "next/link";
import type { Metadata } from "next";
import { formatDate, getPublishedPosts, readingTime } from "@/lib/blog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blog",
  description: "Knitting tips, new ideas and stories about making things by hand, from Bella Summer Rose Designs.",
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const posts = await getPublishedPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort();
  const shown = c ? posts.filter((p) => p.category === c) : posts;
  const [lead, ...rest] = shown;

  return (
    <div className="wrap">
      <div className="page-title">
        <p className="hand">from the knitting basket</p>
        <h1>The blog</h1>
        <p>Short reads on knitting techniques, new ideas worth trying, and running a small handmade business from home.</p>
      </div>

      {categories.length > 1 && (
        <nav className="chips" aria-label="Topics" style={{ marginTop: 20 }}>
          <Link href="/blog" className="chip" aria-current={!c ? "page" : undefined}>All</Link>
          {categories.map((cat) => (
            <Link key={cat} href={`/blog?c=${encodeURIComponent(cat)}`} className="chip" aria-current={c === cat ? "page" : undefined}>
              {cat}
            </Link>
          ))}
        </nav>
      )}

      {!lead ? (
        <div className="empty-state" style={{ marginTop: 28 }}>
          <h3>The first post is on its way</h3>
          <p>New posts appear here a few times a week.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 40, marginTop: 28 }}>
          <Link href={`/blog/${lead.slug}`} className="post-lead">
            <span className="label">{[lead.category, formatDate(lead.date)].filter(Boolean).join(" · ")}</span>
            <h2>{lead.title}</h2>
            {lead.summary && <p>{lead.summary}</p>}
            <span className="read-more">Read the post · {readingTime(lead.body)} →</span>
          </Link>
          {rest.length > 0 && (
            <div className="post-grid">
              {rest.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card">
                  <span className="label">{[p.category, formatDate(p.date)].filter(Boolean).join(" · ")}</span>
                  <h3>{p.title}</h3>
                  {p.summary && <p>{p.summary}</p>}
                  <span className="read-more">{readingTime(p.body)} →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
