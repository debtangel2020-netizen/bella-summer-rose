import { Header, Footer } from "@/components/SiteChrome";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
