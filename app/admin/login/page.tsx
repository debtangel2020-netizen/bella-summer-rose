"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "That password is not right. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="wrap" style={{ maxWidth: 420, paddingBlock: "12vh" }}>
      <p className="label" style={{ color: "var(--rose)" }}>Bella Summer Rose Designs</p>
      <h1 style={{ fontSize: "2.4rem", margin: "10px 0 24px" }}>Shop admin</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        <label className="field">
          <span>Password</span>
          <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
        </label>
        {error && <p className="error-text" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
    </main>
  );
}
