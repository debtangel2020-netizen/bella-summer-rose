import type { Metadata } from "next";
import { Fraunces, Karla, Caveat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";

const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--f-display",
  display: "swap",
});
const body = Karla({ subsets: ["latin"], variable: "--f-body", display: "swap" });
const hand = Caveat({ subsets: ["latin"], variable: "--f-hand", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Bella Summer Rose Designs", template: "%s · Bella Summer Rose Designs" },
  description: "Handmade with love by Heleen Rose: knitted, woven and braided pieces, made in South Africa and posted worldwide.",
  metadataBase: new URL(process.env.SITE_URL || "https://www.capeluxecollective.shop"),
  openGraph: {
    siteName: "Bella Summer Rose Designs",
    images: [{ url: "/brand/bella-summer-rose-logo.jpg", width: 1408, height: 1408 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${display.variable} ${body.variable} ${hand.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
