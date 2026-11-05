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
  images: string[];
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Settings = {
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
