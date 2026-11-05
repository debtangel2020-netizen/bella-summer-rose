import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <>
      <header className="admin-bar">
        <div className="wrap">
          <b>Shop admin</b>
          <nav aria-label="Admin">
            <Link href="/admin">Products</Link>
            <Link href="/admin/orders">Orders</Link>
            <Link href="/admin/blog">Blog</Link>
            <Link href="/admin/settings">Settings</Link>
            <Link href="/" target="_blank">View shop ↗</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="wrap admin-main">{children}</main>
    </>
  );
}
