import { blobConnected, getSettings } from "@/lib/store";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettings() {
  const settings = await getSettings({ fresh: true });
  const yoco = {
    hasKey: Boolean(process.env.YOCO_SECRET_KEY),
    testMode: (process.env.YOCO_SECRET_KEY ?? "").startsWith("sk_test"),
    hasWebhook: Boolean(process.env.YOCO_WEBHOOK_SECRET),
  };
  const storage = blobConnected || !process.env.VERCEL;
  return (
    <>
      <h1>Settings</h1>
      <SettingsForm settings={settings} yoco={yoco} storage={storage} />
    </>
  );
}
