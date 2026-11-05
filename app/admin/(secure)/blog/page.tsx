import Link from "next/link";
import { formatDate, getAllPosts } from "@/lib/blog";

export default async function AdminBlog() {
  const posts = await getAllPosts();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <div className="section-head" style={{ marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>Blog</h1>
        <Link href="/admin/blog/new" className="btn">+ Write a post</Link>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 20, maxWidth: "64ch" }}>
        New posts are written and published automatically on Mondays, Wednesdays and Fridays. You can edit or hide any post, or write your own.
      </p>
      {posts.length === 0 ? (
        <div className="empty-state"><h3>No posts yet</h3><p>The first automatic post will appear on the next Monday, Wednesday or Friday.</p></div>
      ) : (
        <div className="admin-list">
          {posts.map((p) => (
            <Link key={p.slug} href={`/admin/blog/${p.slug}`} className="admin-row" style={{ gridTemplateColumns: "1fr auto" }}>
              <div className="info">
                <strong>{p.title}</strong>
                <div className="sub">
                  <span>{formatDate(p.date)}</span>
                  {p.category && <span>{p.category}</span>}
                  <span>{p.source === "own" ? "Written by you" : p.edited ? "Automatic, edited by you" : "Automatic"}</span>
                </div>
              </div>
              <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                {p.hidden ? <span className="pill draft">Hidden</span> : p.date > today ? <span className="pill pending">Scheduled</span> : <span className="pill paid">Live</span>}
                <span className="label">Edit →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
