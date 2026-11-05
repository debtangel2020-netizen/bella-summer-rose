import Link from "next/link";
import { CartLink } from "./CartLink";
import type { Settings } from "@/lib/types";
import { rand } from "@/lib/money";

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="wordmark" aria-label="Bella Summer Rose Designs, home">
          <b>Bella Summer Rose</b>
          <span>hand-knitted designs</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/shop">Shop</Link>
          <Link href="/#about" className="hide-sm">About</Link>
          <Link href="/#delivery" className="hide-sm">Delivery</Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="stitch" aria-hidden="true" />
      <div className="wrap">
        <div>
          <h3>Bella Summer Rose Designs</h3>
          <p>{settings.tagline}</p>
        </div>
        <div>
          <p className="label" style={{ marginBottom: 10 }}>Get in touch</p>
          <ul>
            {settings.shopEmail && <li>Email: <span style={{ userSelect: "all" }}>{settings.shopEmail}</span></li>}
            {settings.whatsapp && <li>WhatsApp: <span style={{ userSelect: "all" }}>{settings.whatsapp}</span></li>}
            {settings.instagram && (
              <li>
                Instagram:{" "}
                <a href={`https://instagram.com/${settings.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer">
                  @{settings.instagram.replace(/^@/, "")}
                </a>
              </li>
            )}
            {!settings.shopEmail && !settings.whatsapp && !settings.instagram && <li>Contact details coming soon.</li>}
          </ul>
        </div>
        <div>
          <p className="label" style={{ marginBottom: 10 }}>Delivery</p>
          <ul>
            <li>South Africa: {rand(settings.domesticShipping)}{settings.freeDomesticOver > 0 ? `, free over ${rand(settings.freeDomesticOver)}` : ""}</li>
            <li>International: {rand(settings.internationalShipping)}</li>
            <li>Secure card payments by Yoco</li>
          </ul>
        </div>
        <p className="fine">© {year} Bella Summer Rose Designs · Prices in South African Rand (ZAR)</p>
      </div>
    </footer>
  );
}
