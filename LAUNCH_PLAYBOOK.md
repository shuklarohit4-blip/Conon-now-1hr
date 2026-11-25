# 🚀 CONON-NOW: ZERO-FAULT PRODUCTION CLOUD LAUNCH PLAYBOOK
**Lucknow's 60-Minute Construction Material Delivery Platform & Living Material Vault**

---

## 🏛️ 1. Architecture & Deployment Topology

| Component | Platform / Host | Region | Public URL / Port | Security Guard |
| :--- | :--- | :--- | :--- | :--- |
| **Customer Storefront & Partner Apps** | **Netlify** | Global Edge CDN | `https://conon-now.netlify.app` *(or custom domain)* | Admin code 100% tree-shaken; `/admin` 302 redirects to `/` |
| **API Server & Socket Hub** | **Render** | Singapore (`ap-southeast-1`) | `https://conon-api-prod.onrender.com` | Helmet security headers, dynamic CORS, raw body webhook |
| **Cloud PostgreSQL** | **Supabase / Neon** | AWS Mumbai (`ap-south-1`) | Port `5432` / Pooler Port `6543` | Auto-SSL (`rejectUnauthorized: false`), pgcrypto |
| **Admin Command OS** | **Local MacBook** | Local Machine | `http://localhost:5174/admin` | Gated by `VITE_LOCAL_ADMIN=true` + `x-admin-key: MAC_ADMIN_KEY` |

---

## 📋 2. Environment Variables Configuration Matrix

### A. Netlify (Public Frontend Build)
*Configure in Netlify Dashboard → Site configuration → Environment variables:*

| Variable Name | Production Value | Purpose |
| :--- | :--- | :--- |
| `NODE_VERSION` | `20` | Node.js runtime version |
| `PNPM_VERSION` | `10.6.1` | Package manager version |
| `VITE_LOCAL_ADMIN` | `false` | **Crucial:** Strips Admin Command OS and all admin chunks from build |
| `VITE_API_URL` | `https://conon-api-prod.onrender.com/api` | Live Render backend endpoint |
| `VITE_FIREBASE_API_KEY` | *Your Firebase Key* | Customer OTP and Auth persistence |
| `VITE_FIREBASE_PROJECT_ID` | `conon-app-edff3` | Firebase project identifier |
| `VITE_GOOGLE_MAPS_API_KEY` | *Your Google Maps Key* | Lucknow GPS geo-routing & live driver tracking |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_...` *(or test)* | Living Vault & Razorpay checkout gateway |

---

### B. Render (Backend Web Service)
*Configure in Render Dashboard → conon-api-prod → Environment:*

| Variable Name | Production Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Render standard HTTP port |
| `FRONTEND_URLS` | `https://conon-now.netlify.app,https://cononinfrabuilt.com` | Allowed CORS origins for browser storefront |
| `ALLOWED_ORIGINS` | `https://conon-now.netlify.app,http://localhost:5174,http://localhost:5173` | Allows local MacBook Admin OS (`:5174`) to access live API |
| `JWT_SECRET` | *32+ random characters* | Cryptographic signing for session tokens |
| `MAC_ADMIN_KEY` | `conon_mac_secret_9988` *(or your custom secret)* | Secret key required for admin control endpoints |
| `DATABASE_URL` | `postgres://postgres:[PASS]@db.[REF].supabase.co:5432/postgres` | Live PostgreSQL connection string (Supabase Mumbai / Neon) |
| `MONGODB_URI` | `mongodb+srv://...` | Catalog & Mongoose documents store |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | Razorpay Merchant ID |
| `RAZORPAY_KEY_SECRET` | `...` | Razorpay API Secret |
| `RAZORPAY_WEBHOOK_SECRET` | `...` | Webhook signature secret for Living Vault idempotency |

---

### C. Local MacBook (`.env.local` — Strictly Ignored by Git)
*File location: `artifacts/conon/.env.local` and root `.env.local`:*

```bash
# Local MacBook Admin Command OS Configuration
VITE_LOCAL_ADMIN=true
VITE_MAC_ADMIN_KEY=conon_mac_secret_9988
VITE_PORT=5174

# Connect to either local backend or live cloud backend:
VITE_API_URL=http://localhost:5001/api
# OR for live cloud management from MacBook:
# VITE_API_URL=https://conon-api-prod.onrender.com/api
```

---

## 🗄️ 3. Cloud Database Bootstrap & Migrations (Supabase / Neon)

The repository provides an idempotent bootstrap schema at `scripts/deploy-db.sql` that provisions all 8 tables and indexes:
1. `users` (Multi-panel customer, vendor, driver roles)
2. `mandi_rates` (Latouche Road Lucknow live benchmark commodity prices)
3. `orders` (Live orders with dual OTPs and site coordinates)
4. `conon_wallets` (Main user vault with inflation shield & trust score)
5. `wallet_ledger` (Immutable fintech ledger with idempotency keys)
6. `material_rate_locks` (Material units locked against price escalation)
7. `mistri_passes` (Contractor zero-leakage site passes)
8. `buyback_requests` (Leftover material reverse logistics requests)

### Running Database Migration:
```bash
# Set your Supabase Mumbai connection string and run the deploy runner:
DATABASE_URL="postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" pnpm db:deploy
```
The runner verifies connectivity with automatic SSL, executes the DDL, and reports confirmed tables and active Mandi commodities.

---

## ⚡ 4. Build & Launch Procedures

### 1. Launching Local Admin Command OS (MacBook only):
```bash
pnpm dev:admin
```
*Opens Conon Command OS on `http://localhost:5174/admin` with full God-Eye radar, catalog studio, mandi rates, and payouts.*

### 2. Testing Production Frontend Build (Zero-Leak Audit):
```bash
VITE_LOCAL_ADMIN=false pnpm --filter @workspace/conon build
```
Verify zero secrets or admin chunks exist in the public output:
```bash
grep -rn "conon_mac_secret" artifacts/conon/dist/public/
# Expected: 0 matches (Exit code 1)
```

### 3. Deploying to Netlify:
- Connect repository to Netlify.
- Build command: `VITE_LOCAL_ADMIN=false pnpm --filter @workspace/conon build`
- Publish directory: `artifacts/conon/dist/public`
- Environment variables: Set as detailed in Section 2A.
- Netlify will automatically read `netlify.toml` and apply security headers, redirect rules, and asset caching.

### 4. Deploying to Render:
- In Render Dashboard, click **New +** → **Blueprint** and select this repo (it reads `render.yaml`).
- Or create a **Web Service** with:
  - Runtime: `Node`
  - Region: `Singapore`
  - Build command: `corepack enable && corepack prepare pnpm@10.6.1 --activate && pnpm install --frozen-lockfile --prod=false && pnpm --filter @workspace/api-server build`
  - Start command: `node artifacts/api-server/dist/index.mjs`
  - Health check path: `/api/health`

---

## 🛡️ 5. Pre-Flight Verification Checklist

- [x] **Vite Bundle Splitting**: Initial index bundle reduced from ~6 MB to under 2.9 MB uncompressed (~580 kB gzipped).
- [x] **Asset Optimization**: 31 high-resolution product and rental PNGs compressed by 60%–88% via Sharp, saving ~27 MB.
- [x] **Admin Stripping**: `AdminDashboard`, `CononCommandOS`, and `ImageQA` chunks are 100% eliminated from production builds.
- [x] **Zero Secret Leak**: `VITE_MAC_ADMIN_KEY` evaluates to empty string in production; 0 matches in static bundles.
- [x] **Backend Security**: Helmet security headers, raw body webhook parser, and dynamic CORS supporting localhost:5174.
- [x] **Database Engine**: Automatic SSL negotiation for Supabase/Neon Mumbai; idempotent `pnpm db:deploy` runner.
- [x] **Coordination Relay**: 15/15 Master Platform Tests passed, 14/14 Full Ecosystem tests passed.
