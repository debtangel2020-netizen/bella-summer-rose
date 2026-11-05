import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatDate, getPost, getPublishedPosts, readingTime } from "@/lib/blog";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post.hidden) return { title: "Not found" };
  return { title: post.title, description: post.summary };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post.hidden) notFound();
  const more = (await getPublishedPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="wrap">
      <article className="post">
        <p style={{ paddingTop: 24 }}>
          <Link href="/blog" className="label" style={{ textDecoration: "none" }}>← All posts</Link>
        </p>
        <header className="post-head">
          <span className="label">{[post.category, formatDate(post.date), readingTime(post.body)].filter(Boolean).join(" · ")}</span>
          <h1>{post.title}</h1>
          {post.summary && <p className="post-summary">{post.summary}</p>}
        </header>
        <div className="stitch" aria-hidden="true" style={{ maxWidth: 180 }} />
        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
        <aside className="post-cta">
          <p className="hand">made by hand, just for you</p>
          <p>Every piece in the shop is knitted by Heleen, one stitch at a time.</p>
          <Link href="/shop" className="btn">Browse the collection</Link>
        </aside>
      </article>

      {more.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>More from the blog</h2></div>
          <div className="post-grid">
            {more.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card">
                <span className="label">{[p.category, formatDate(p.date)].filter(Boolean).join(" · ")}</span>
                <h3>{p.title}</h3>
                {p.summary && <p>{p.summary}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
