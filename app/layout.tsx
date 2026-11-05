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
  description: "Hand-knitted pieces by Heleen Rose. Made in South Africa, posted worldwide.",
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
