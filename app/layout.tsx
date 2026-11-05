import type { Metadata } from "next";
import { Gloock, Figtree, DM_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";

const display = Gloock({ subsets: ["latin"], weight: "400", variable: "--f-display", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--f-body", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Bella Summer Rose Designs", template: "%s · Bella Summer Rose Designs" },
  description: "Hand-knitted pieces by Heleen Rose. Made in South Africa, posted worldwide.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
