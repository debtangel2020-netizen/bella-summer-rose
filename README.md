# Bella Summer Rose Designs: online shop

Heleen Rose's hand-knitting shop. Built with Next.js, hosted on Vercel, card payments by Yoco.

**What's included**
- Home page, shop page with categories, and a page for each product with a photo gallery
- Cart and checkout with delivery prices for South Africa and international orders
- Card payments through Yoco. Stock goes down automatically when an order is paid.
- Admin area at `/admin` for Heleen: add products and photos from her phone, see orders, mark them as posted, and change delivery prices and contact details

---

## Going live (about 30 minutes, no coding)

You need three free accounts: **GitHub**, **Vercel** and **Yoco** (Yoco needs your business details and bank account for payouts).

### 1. Put the code on GitHub
1. Sign in at github.com, click **New repository**, name it `bella-summer-rose`, choose **Private** and click **Create repository**.
2. On the next page click **uploading an existing file**.
3. Unzip `bella-summer-rose.zip` on your computer, open the folder, select **everything inside it** and drag it into the GitHub page. Click **Commit changes**.

### 2. Create the site on Vercel
1. Sign in at vercel.com with your GitHub account.
2. Click **Add New → Project**, pick `bella-summer-rose` and click **Deploy**. The first deploy takes about a minute.

### 3. Connect storage for photos and products
1. In the Vercel project, open **Storage → Create Database → Blob**, then **Create** and **Connect** it to the project.
   Vercel connects it for you (you will see `BLOB_STORE_ID` in the environment variables).

### 4. Add the passwords and the Yoco key
In the project, open **Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | The password Heleen will use to log in. Make it long. |
| `SESSION_SECRET` | Any long jumble of letters and numbers |
| `YOCO_SECRET_KEY` | From the Yoco app or portal: **Sales → Payment Gateway**. Start with the **test** key (`sk_test_…`). |

Then open **Deployments**, click the **⋯** on the latest one and choose **Redeploy**. New settings only apply after a redeploy.

### 5. Connect Yoco order confirmations
1. Go to `your-site.vercel.app/admin`, log in, and open **Settings**.
2. Click **Connect Yoco payments**. A secret appears. Copy it.
3. In Vercel add one more environment variable: `YOCO_WEBHOOK_SECRET` = the secret. Redeploy again.

### 6. Test it
Add a product in the admin, buy it on the shop using a test card from Yoco's developer docs (no real money moves in test mode), and check that the order shows as **Paid** under **Orders** and the stock went down.

### 7. Switch on real payments
1. In Vercel, change `YOCO_SECRET_KEY` to the **live** key (`sk_live_…`) and **delete** `YOCO_WEBHOOK_SECRET`. Redeploy.
2. Repeat step 5 (Connect Yoco payments) so live payments are confirmed too.

### 8. Your own web address (optional)
Buy a domain (for example `bellasummerrose.co.za`), then in Vercel open **Settings → Domains**, add it and follow the instructions to point it at Vercel.

---

## Day-to-day for Heleen
- **Add a piece:** `/admin` → **Add a product** → add photos, name, price and how many are in stock → **Add to shop**.
- **One-off pieces:** set stock to 1. The shop shows "One of a kind", and it shows "Sold out" once bought.
- **Hide a piece:** untick **Show in the shop**.
- **New order:** **Orders** shows the delivery address, the customer's email and phone, and any note they left. Once it's posted, add the tracking number and click **Mark as posted**.
- **Delivery prices and contact details:** **Settings**.

## Notes
- Yoco charges in Rand. Overseas customers pay by card and their bank converts the amount.
- The site doesn't send order emails yet. Check **Orders** (Yoco also sends a payment notification). Order emails can be added later with a service like Resend.
- Running it on your own computer: `npm install`, copy `.env.example` to `.env.local` and fill in `ADMIN_PASSWORD`, then `npm run dev`. Without a Blob token, products and photos are saved in local folders.
