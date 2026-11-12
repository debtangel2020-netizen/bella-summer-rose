export type Variant = {
  id: string;
  /** Colour name shown to customers, e.g. "Sage" */
  name: string;
  /** "stock" = already made (uses stock count), "order" = made to order */
  mode: "stock" | "order";
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  /** Price in cents (ZAR). R450 = 45000 */
  price: number;
  description: string;
  materials: string;
  size: string;
  care: string;
  /** Hours on the needles, optional */
  hours: number | null;
  stock: number;
  /** Colour options. Empty = no colour choice (uses stock above). */
  variants: Variant[];
  /** Making time for made-to-order colours, e.g. "about 2 weeks" */
  makingTime: string;
  images: string[];
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Settings = {
  /** Big home page headline; one phrase per line. The middle line is shown in italic caramel. */
  headline: string;
  tagline: string;
  about: string;
  /** Photo of Heleen for the About section (URL), empty for the placeholder */
  aboutPhoto: string;
  shopEmail: string;
  whatsapp: string;
  instagram: string;
  /** All shipping amounts in cents */
  domesticShipping: number;
  freeDomesticOver: number;
  internationalShipping: number;
};

export type OrderItem = {
  productId: string;
  variantId?: string;
  /** Colour chosen, if the product has colours */
  variant?: string;
  madeToOrder?: boolean;
  name: string;
  price: number;
  qty: number;
  image: string | null;
};

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: { name: string; email: string; phone: string };
  address: {
    line1: string;
    line2: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  note: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  checkoutId?: string;
  paymentId?: string;
  paidAt?: string;
  tracking?: string;
};

export const DEFAULT_SETTINGS: Settings = {
  headline: "Woven with intention,\nknit by hand,\nmade to wander.",
  tagline: "Hand-knitted pieces, made slowly and made to be kept.",
  about:
    "Every piece in this shop is knitted by hand, one stitch at a time, by Heleen Rose. The shop is named after the people she knits for first: Bella, Summer and the Rose family. Each item is made in small numbers from yarns chosen for softness and wear, then washed, blocked and finished by hand before it is posted to you.",
  aboutPhoto: "",
  shopEmail: "",
  whatsapp: "",
  instagram: "",
  domesticShipping: 10000,
  freeDomesticOver: 150000,
  internationalShipping: 45000,
};
