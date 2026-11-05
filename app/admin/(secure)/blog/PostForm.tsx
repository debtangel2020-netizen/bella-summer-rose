"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/blog";

export function PostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const isAuto = post?.source === "auto";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const f = new FormData(e.currentTarget);
    const payload = {
      title: String(f.get("title") ?? ""),
      summary: String(f.get("summary") ?? ""),
      category: String(f.get("category") ?? ""),
      date: String(f.get("date") ?? ""),
      body: String(f.get("body") ?? ""),
      hidden: f.get("visible") !== "on",
    };
    const res = await fetch(post ? `/api/admin/blog/${post.slug}` : "/api/admin/blog", {
      method: post ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not save the post.");
      return;
    }
    if (!post) router.replace(`/admin/blog/${data.post.slug}`);
    else setSaved(true);
    router.refresh();
  }

  async function onRemove() {
    if (!post) return;
    setBusy(true);
    const res = await fetch(`/api/admin/blog/${post.slug}`, { method: "DELETE" });
    if (res.ok) {
      router.replace("/admin/blog");
      router.refresh();
    } else {
      setBusy(false);
      setError("Could not remove the post.");
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {isAuto && (
        <p className="notice">This post was written automatically. Your changes replace the original wording on the website.</p>
      )}
      <label className="field"><span>Title</span><input id="title" name="title" required defaultValue={post?.title} /></label>
      <label className="field"><span>Short summary</span><input id="summary" name="summary" defaultValue={post?.summary} placeholder="One sentence shown on the blog page" /></label>
      <div className="two">
        <label className="field"><span>Topic</span><input id="category" name="category" defaultValue={post?.category} placeholder="e.g. Techniques, Ideas, Home business" /></label>
        <label className="field"><span>Date</span><input id="date" name="date" type="date" required defaultValue={post?.date ?? new Date().toISOString().slice(0, 10)} disabled={isAuto} /></label>
      </div>
      <label className="field">
        <span>Post</span>
        <textarea id="body" name="body" rows={16} required defaultValue={post?.body} />
        <small>Leave an empty line between paragraphs. Start a line with ## for a heading, or - for a bullet point.</small>
      </label>
      <label className="check"><input id="visible" name="visible" type="checkbox" defaultChecked={!post?.hidden} /><span><strong>Show on the website</strong></span></label>
      {error && <p className="error-text" role="alert">{error}</p>}
      {saved && <p className="notice" role="status">Saved. Changes are live on the blog.</p>}
      <div className="form-actions">
        <button className="btn" type="submit" disabled={busy}>{busy ? "Saving…" : post ? "Save changes" : "Publish post"}</button>
        {post && (confirmRemove ? (
          <span style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span>{isAuto ? "Hide this post from the website?" : "Delete this post for good?"}</span>
            <button type="button" className="btn danger small" onClick={onRemove} disabled={busy}>{isAuto ? "Yes, hide it" : "Yes, delete"}</button>
            <button type="button" className="btn ghost small" onClick={() => setConfirmRemove(false)}>Keep it</button>
          </span>
        ) : (
          <button type="button" className="btn danger small" onClick={() => setConfirmRemove(true)}>{isAuto ? "Hide post" : "Delete post"}</button>
        ))}
      </div>
    </form>
  );
}
