"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/types";
import { uploadPhoto } from "@/lib/uploadPhoto";

type Yoco = { hasKey: boolean; testMode: boolean; hasWebhook: boolean };

export function SettingsForm({ settings, yoco, storage }: { settings: Settings; yoco: Yoco; storage: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [hookError, setHookError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [aboutPhoto, setAboutPhoto] = useState(settings.aboutPhoto);
  const [photoBusy, setPhotoBusy] = useState(false);

  async function onAboutPhoto(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    setError(null);
    try {
      setAboutPhoto(await uploadPhoto(file));
      setMsg("Photo uploaded. Click Save settings to put it on the website.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The photo could not be uploaded.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setError(null);
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(f.entries())),
    });
    setBusy(false);
    if (res.ok) {
      setMsg("Settings saved.");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not save settings.");
    }
  }

  async function connectYoco() {
    setHookError(null);
    setBusy(true);
    const res = await fetch("/api/admin/yoco-webhook", { method: "POST" });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok && d.secret) setSecret(d.secret);
    else setHookError(d.error || "Could not connect to Yoco.");
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const r = (c: number) => (c / 100).toString();

  return (
    <div style={{ display: "grid", gap: 40 }}>
      <section className="order-card" style={{ maxWidth: 760 }}>
        <h2 style={{ fontSize: "1.5rem" }}>Payments and storage</h2>
        <p>Photo and product storage: {storage ? <span className="pill paid">Connected</span> : <span className="pill pending">Not connected — add a Blob store in Vercel</span>}</p>
        <p>
          Yoco key:{" "}
          {yoco.hasKey ? (
            <span className={`pill ${yoco.testMode ? "pending" : "paid"}`}>{yoco.testMode ? "Test mode (no real money)" : "Live"}</span>
          ) : (
            <span className="pill pending">Missing — add YOCO_SECRET_KEY in Vercel</span>
          )}
        </p>
        <p>
          Order confirmations from Yoco:{" "}
          {yoco.hasWebhook ? <span className="pill paid">Connected</span> : <span className="pill pending">Not connected yet</span>}
        </p>
        {yoco.hasKey && !yoco.hasWebhook && !secret && (
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>
              This tells Yoco to notify the shop when a payment succeeds, so orders are marked paid and stock goes down. Do this once, on the live site.
            </p>
            <div><button type="button" className="btn small" onClick={connectYoco} disabled={busy}>Connect Yoco payments</button></div>
          </div>
        )}
        {hookError && <p className="error-text" role="alert">{hookError}</p>}
        {secret && (
          <div className="notice" style={{ display: "grid", gap: 10 }}>
            <strong>Almost done. Copy this secret into Vercel:</strong>
            <code className="copyable" style={{ overflowWrap: "anywhere", fontFamily: "var(--font-mono)" }}>{secret}</code>
            <div><button type="button" className="btn small" onClick={() => copy(secret)}>{copied ? "Copied" : "Copy secret"}</button></div>
            <p style={{ fontSize: "0.9rem" }}>
              In Vercel, open the project, go to Settings, then Environment Variables. Add <b>YOCO_WEBHOOK_SECRET</b> with this value, save, then redeploy.
              Yoco shows this secret only once.
            </p>
          </div>
        )}
      </section>

      <form className="admin-form" onSubmit={onSubmit}>
        <h2 style={{ fontSize: "1.5rem" }}>Shop details</h2>
        <label className="field">
          <span>Headline</span>
          <textarea id="headline" name="headline" rows={3} defaultValue={settings.headline} style={{ minHeight: 0 }} />
          <small>The big words at the top of the home page. Put each phrase on its own line; the middle line shows in italic caramel.</small>
        </label>
        <label className="field"><span>Tagline</span><input id="tagline" name="tagline" defaultValue={settings.tagline} /><small>One short sentence shown under the headline and in the footer.</small></label>
        <label className="field"><span>About Heleen</span><textarea id="about" name="about" rows={6} defaultValue={settings.about} /></label>
        <div className="field">
          <span>Photo of Heleen</span>
          <small>Shown next to the About text on the home page. A portrait photo (taller than wide) works best.</small>
          <input type="hidden" name="aboutPhoto" value={aboutPhoto} />
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
            <div className="photo" style={{ width: 120, borderRadius: "60px 60px 10px 10px" }}>
              {aboutPhoto ? <img src={aboutPhoto} alt="Heleen" /> : null}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <label className="btn small ghost" style={{ cursor: "pointer" }}>
                <input id="aboutPhotoFile" type="file" accept="image/*" hidden onChange={(e) => { onAboutPhoto(e.target.files); e.target.value = ""; }} />
                {photoBusy ? "Uploading…" : aboutPhoto ? "Change photo" : "Upload photo"}
              </label>
              {aboutPhoto && <button type="button" className="btn small danger" onClick={() => setAboutPhoto("")}>Remove photo</button>}
            </div>
          </div>
        </div>
        <div className="three">
          <label className="field"><span>Contact email</span><input id="shopEmail" name="shopEmail" type="email" defaultValue={settings.shopEmail} /></label>
          <label className="field"><span>WhatsApp number</span><input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} placeholder="+27 …" /></label>
          <label className="field"><span>Instagram handle</span><input id="instagram" name="instagram" defaultValue={settings.instagram} placeholder="@bellasummerrose" /></label>
        </div>

        <h2 style={{ fontSize: "1.5rem", marginTop: 12 }}>Delivery prices (Rand)</h2>
        <div className="three">
          <label className="field"><span>South Africa</span><input id="domesticShipping" name="domesticShipping" inputMode="decimal" defaultValue={r(settings.domesticShipping)} /></label>
          <label className="field"><span>Free in SA on orders over</span><input id="freeDomesticOver" name="freeDomesticOver" inputMode="decimal" defaultValue={r(settings.freeDomesticOver)} /><small>Use 0 to never offer free delivery.</small></label>
          <label className="field"><span>International</span><input id="internationalShipping" name="internationalShipping" inputMode="decimal" defaultValue={r(settings.internationalShipping)} /></label>
        </div>

        {error && <p className="error-text" role="alert">{error}</p>}
        {msg && <p className="notice" role="status">{msg}</p>}
        <div className="form-actions"><button className="btn" type="submit" disabled={busy || photoBusy}>Save settings</button></div>
      </form>
    </div>
  );
}
