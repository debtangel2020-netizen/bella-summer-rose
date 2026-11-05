import type { Metadata } from "next";
import { getSettings } from "@/lib/store";
import { CartView } from "./CartView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage({ searchParams }: { searchParams: Promise<{ cancelled?: string; failed?: string }> }) {
  const [settings, sp] = await Promise.all([getSettings(), searchParams]);
  const message = sp.failed
    ? "The payment did not go through. Nothing was charged. Please check your card details and try again."
    : sp.cancelled
    ? "Payment was cancelled. Your cart is still here when you are ready."
    : null;
  return (
    <div className="wrap">
      <CartView
        message={message}
        shipping={{
          domesticShipping: settings.domesticShipping,
          freeDomesticOver: settings.freeDomesticOver,
          internationalShipping: settings.internationalShipping,
        }}
      />
    </div>
  );
}
