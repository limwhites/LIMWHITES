# LIM WHITES — PhonePe Payment Gateway, Real SMS, Owner Desk & SEO Setup

---

## 1. Real ₹3,000 PhonePe Gateway + Zero-Fake Verification

How the payment flow works end-to-end:
1. Customer fills out all VIP details + accepts Terms & Conditions and clicks **`NEXT: PAY ₹3,000 VIA PHONEPE GATEWAY`**.
2. Server endpoint `POST /api/phonepe/initiate` creates a `PENDING_PAYMENT` record with `300000` paise (`₹3,000`) locked server-side and gets the real PhonePe Checkout URL.
3. Customer is redirected to PhonePe's hosted payment page to pay ₹3,000.
4. When PhonePe redirects back to `/?phonepe_txn=...`, the site automatically runs `GET /api/phonepe/verify?txnId=...` against PhonePe's Status API:
   - **Only if PhonePe confirms `COMPLETED` / `PAYMENT_SUCCESS` for ₹3,000**:
     - Application is marked `PAID`, real confirmation **SMS** is sent to the customer's `+91` mobile, and the personalized **Digital Thank You Card** opens.
   - **If payment was cancelled, failed, or unpaid**:
     - Digital Thank You Card is **blocked**, and the customer sees a Retry Payment prompt.

### How to Activate PhonePe Live / UAT Keys:
1. Copy `.env.example` to `.env` in the project root.
2. From your **PhonePe for Business Developer Dashboard**, paste either:
   - **V2 OAuth Credentials:** `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_CLIENT_VERSION`
   - **OR V1 Salt Credentials:** `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`, `PHONEPE_SALT_INDEX`
3. Set `PHONEPE_ENV=SANDBOX` for testing or `PHONEPE_ENV=PRODUCTION` when live.

---

## 2. Real SMS Confirmation to Customer's Phone (+91)

As soon as PhonePe verifies `₹3,000` payment, the server automatically sends:
> *"LIM WHITES: Thank you [Name]! Your VIP Early Access application ([ID]) for [SKU] Size [Size] is confirmed after Rs.3,000 PhonePe payment. Please wait, our team will contact you soon."*

Configure **any one** SMS provider in `.env`:
- **Fast2SMS (India):** `FAST2SMS_API_KEY=...`
- **Twilio:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- **MSG91:** `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`

---

## 3. Hosting Note (Important for PhonePe & SMS)
Because PhonePe API signature/token verification and SMS sending use secret keys, host this app as a **Node Web Service** (e.g. **Render.com**, **Railway**, or a VPS):
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start` *(runs `server.mjs` serving both the React site and `/api/phonepe/*`, `/api/applications`)*
- Add all `.env` keys in your hosting provider's **Environment Variables** dashboard.

---

## 4. Private Unlinked Owner Desk (`/lw-concierge`)
- Open `https://yourdomain.com/lw-concierge` (Passcode: `LIMWHITES2026` or your `VITE_OWNER_PIN`).
- View only verified `PAID` vs `FAILED` entries, SMS delivery status, mark `Allotted` or `Not Selected`, and send 1-click Email / WhatsApp / Instagram DM replies.

---

## 5. Google Search Console & Gen-Z / Metro / Club SEO Regex
1. Replace `https://limwhites.com` in `index.html`, `public/robots.txt`, and `public/sitemap.xml` with your live HTTPS domain.
2. Verify in [Google Search Console](https://search.google.com/search-console) (`google-site-verification` meta tag in `index.html`), submit `sitemap.xml`, and request indexing.
3. Custom Regex Filters in Search Console → Performance → Query:
   - **Brand & Hoodies:** `(?i)(lim\s*whites|bape|shark\s*hoodie|camo\s*hoodie|zip\s*hoodie)`
   - **Gen-Z Luxury & Club Wear:** `(?i)(luxury\s*streetwear|gen\s*z\s*fashion|club\s*wear|nightlife\s*outfit|vip\s*fashion|vip\s*access)`
   - **Metro Cities:** `(?i)(mumbai|delhi|ncr|gurugram|bangalore|bengaluru|hyderabad|pune|chandigarh|goa|kolkata|india)`
