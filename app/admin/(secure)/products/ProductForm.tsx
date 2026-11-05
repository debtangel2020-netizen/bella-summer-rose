"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { uploadPhoto } from "@/lib/uploadPhoto";

export function ProductForm({ product, categories }: { product?: Product; categories: string[] }) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const url = await uploadPhoto(file);
        setImages((prev) => [...prev, url]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "A photo could not be uploaded.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function move(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get("name") ?? ""),
      category: String(f.get("category") ?? ""),
      price: String(f.get("price") ?? ""),
      stock: String(f.get("stock") ?? "0"),
      description: String(f.get("description") ?? ""),
      materials: String(f.get("materials") ?? ""),
      size: String(f.get("size") ?? ""),
      care: String(f.get("care") ?? ""),
      hours: String(f.get("hours") ?? ""),
      featured: f.get("featured") === "on",
      published: f.get("published") === "on",
      images,
    };
    const res = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save. Please try again.");
      return;
    }
    if (!product) {
      router.replace(`/admin/products/${data.product.id}?created=1`);
    } else {
      setSaved(true);
    }
    router.refresh();
  }

  async function onDelete() {
    if (!product) return;
    setSaving(true);
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setSaving(false);
      setError("Could not delete. Please try again.");
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <section className="field">
        <span>Photos</span>
        <small>The first photo is the cover shown in the shop. Daylight near a window works best.</small>
        <div className="photo-grid" style={{ marginTop: 6 }}>
          {images.map((src, i) => (
            <div className="photo" key={src}>
              <img src={src} alt={`Photo ${i + 1}`} />
              {i === 0 && <span className="cover">Cover</span>}
              <div className="tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">←</button>
                <button type="button" onClick={() => setImages((p) => p.filter((x) => x !== src))} aria-label="Remove photo">✕</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Move later">→</button>
              </div>
            </div>
          ))}
          <label className="upload">
            <input id="photos" type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
            {uploading > 0 ? `Uploading ${uploading}…` : "+ Add photos"}
          </label>
        </div>
      </section>

      <label className="field"><span>Name</span><input id="name" name="name" required defaultValue={product?.name} placeholder="e.g. Rosebud cable-knit baby cardigan" /></label>

      <div className="three">
        <label className="field"><span>Price (Rand)</span><input id="price" name="price" inputMode="decimal" required defaultValue={product ? (product.price / 100).toString() : ""} placeholder="450" /></label>
        <label className="field"><span>How many in stock</span><input id="stock" name="stock" type="number" min={0} required defaultValue={product?.stock ?? 1} /></label>
        <label className="field">
          <span>Category</span>
          <input id="category" name="category" list="cat-list" defaultValue={product?.category} placeholder="e.g. Baby, Scarves, Blankets" />
          <datalist id="cat-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
      </div>

      <label className="field"><span>Description</span><textarea id="description" name="description" defaultValue={product?.description} placeholder="What it is, who it is for, what makes it special." /></label>

      <div className="two">
        <label className="field"><span>Yarn & fibre</span><input id="materials" name="materials" defaultValue={product?.materials} placeholder="e.g. 100% merino wool, DK weight" /></label>
        <label className="field"><span>Size</span><input id="size" name="size" defaultValue={product?.size} placeholder="e.g. 0–6 months, or 180 × 25 cm" /></label>
      </div>
      <div className="two">
        <label className="field"><span>Care instructions</span><input id="care" name="care" defaultValue={product?.care} placeholder="e.g. Hand wash cold, dry flat" /></label>
        <label className="field"><span>Hours on the needles (optional)</span><input id="hours" name="hours" type="number" min={0} defaultValue={product?.hours ?? ""} placeholder="e.g. 14" /></label>
      </div>

      <label className="check"><input id="published" name="published" type="checkbox" defaultChecked={product?.published ?? true} /><span><strong>Show in the shop</strong><br /><small style={{ color: "var(--muted)" }}>Untick to hide it while you work on it.</small></span></label>
      <label className="check"><input id="featured" name="featured" type="checkbox" defaultChecked={product?.featured ?? false} /><span><strong>Feature on the home page</strong></span></label>

      {error && <p className="error-text" role="alert">{error}</p>}
      {saved && <p className="notice" role="status">Saved. Changes are live in the shop.</p>}

      <div className="form-actions">
        <button className="btn" type="submit" disabled={saving || uploading > 0}>{saving ? "Saving…" : product ? "Save changes" : "Add to shop"}</button>
        {product && (
          confirmDelete ? (
            <span style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span>Delete this product for good?</span>
              <button type="button" className="btn danger small" onClick={onDelete} disabled={saving}>Yes, delete</button>
              <button type="button" className="btn ghost small" onClick={() => setConfirmDelete(false)}>Keep it</button>
            </span>
          ) : (
            <button type="button" className="btn danger small" onClick={() => setConfirmDelete(true)}>Delete product</button>
          )
        )}
      </div>
    </form>
  );
}
