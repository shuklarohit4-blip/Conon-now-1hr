# CONON Infrabuilt - Construction-Tech JIT Platform

## Overview

CONON Infrabuilt is a full-stack Construction-Tech application — a Just-in-Time (JIT) logistics platform that connects material suppliers, skilled labor, and site owners. It promises 60-minute delivery for construction essentials.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite, Tailwind CSS v4, Framer Motion, Lucide React
- **Fonts**: DM Sans + Outfit (Google Fonts)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── conon/              # React Vite frontend (CONON app)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Key Features

### Core Shopping
1. **Splash/Logo Screen** — Animated CONON branding with amber glow
2. **Stage-Wise Navigation** — Interactive building stage selector (Foundation → Walls → Roofing → Finishing)
3. **14-Category Grid** — Cement, Steel, Sand, Aggregate, Bricks, Wires, Pipes, Paint, Tiles, Finishing, Hardware, Safety, Tools, Shuttering — each with real Unsplash images
4. **Expert Catalogs** — Cement (OPC/PPC/RHC/LHC/SRC with specs, grades, best-for tags + 9 brand catalogs: UltraTech, ACC, Ambuja, Shree, JK, Birla, Prism, Dalmia, Mycem), Steel (TMT/TMX/HSD/CRS/MS with full specs)
5. **Live Mandi Ticker** — Scrolling real-time prices for Cement, Steel, Sand
6. **Smart Cart** — TruckFillIndicator (weight-based %, color-coded tips)
7. **60-Min JIT Orders** — Countdown timer on placed orders
8. **AR Measure / Voice Order** — Simulated tools in home screen

### Vendor Dashboard (`/vendor`)
- Emerald green theme, PIN auth (1234)
- 4-column inventory grid with product images
- Edit → bottom drawer price modal
- Eye/EyeOff visibility toggle per item
- Incoming order alert banner

### Admin Dashboard (`/admin`)
- Map / Requests / Disputes / Payouts tabs
- Indigo theme

### Digital Parcha (`/parcha`)
- Credit ledger with overdue alerts
- UPI/bank Pay Now drawer

### Project Timeline (`/project`)
- Build progress bar
- Delivery cards with proof photos
- Fullscreen photo viewer

### Design & Architecture Hub (`/designers`)
- Hero: "Professionals on CONON" with stats (120+ Pros, 840+ Projects, 260+ Blueprints)
- 4-column filter: Architects (COA Verified), Interior (IIDA), Landscape (ILA), Vastu
- **Live Portfolio** — Designer cards with shoppable project photos (tap hotspot → buy exact material)
- **Blueprints Marketplace** — Ready-made 2D/3D house maps (PDF+DWG) for fixed price
- **Mood Boards** — Material palettes by designers; "Order All" one-tap bulk add
- Verified professional badges (Gold COA / IIDA)

### Bulk Pricing & Rewards (`/rewards`)
- **Retail/Wholesale Toggle** — Auto-drops prices at bulk thresholds (e.g., 50+ bags → ₹372 wholesale)
- **Product Selector** — UltraTech, ACC, TATA Tiscon, Ambuja, JSW, Asian Paints with live pricing
- **Quantity Slider** — 1 to 500 with animated wholesale unlock progress bar
- **Tier System** — Retail → Wholesale → Contractor → Project Rate
- **CONON Gold Wallet** — Earn via referrals, bulk bonuses, reviews; spend at checkout
- **Referral Program** — "Build with Neighbors" — ₹2,000 Gold credit per referred site
- **Community Shipping** — Free delivery when neighbors order together
- Full-screen referral overlay with unique code + WhatsApp share

## Pages & Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Splash | — |
| `/home` | Home (Shopping) | Customer |
| `/login` | Login | — |
| `/vendor` | Vendor Dashboard | PIN 1234 |
| `/admin` | Admin Dashboard | admin@conon.in / admin123 |
| `/parcha` | Digital Parcha | Customer |
| `/project` | Project Timeline | Customer |
| `/designers` | Design & Architecture Hub | Customer |
| `/rewards` | Bulk Pricing & Rewards | Customer |
| `/services` | Services | Customer |
| `/orders` | Orders | Customer |
| `/profile` | Profile | Customer |

## Bottom Navigation (5 items)

Shop → Design → Rewards → Parcha → Profile

## Design Tokens

- Light theme: bg=white/slate-50, text=slate-900
- Primary: `#1b4366` (navy), Accent: `#f59e0b` (amber)
- Role themes: Customer=navy, Vendor=emerald `#15803d`, Admin=indigo `#1e1b4b`
- Rewards: emerald for wholesale, amber gold for wallet/rewards
- All cards: rounded-[28px], mobile-first max-width 480px

## Database Schema

Tables: `materials`, `carts`, `cart_items`, `services`, `service_bookings`, `orders`, `mandi_prices`

## API Routes

- `GET /api/materials?stage=foundation|walls|roofing|finishing|all`
- `GET|POST /api/cart`
- `DELETE|PATCH /api/cart/:itemId`
- `GET|POST /api/services`
- `GET /api/mandi/prices`
- `GET|POST /api/orders`

## Important Files

- `artifacts/conon/src/pages/Home.tsx` — Category grid, expert catalogs (Cement brands + types, Steel types)
- `artifacts/conon/src/pages/DesignersHub.tsx` — Architect portal, shoppable photos, blueprints, mood boards
- `artifacts/conon/src/pages/BulkRewards.tsx` — Bulk pricing, Gold Wallet, referral program
- `artifacts/conon/src/pages/VendorDashboard.tsx` — Vendor panel: inventory, pricing, visibility
- `artifacts/conon/src/pages/Parcha.tsx` — Digital credit ledger
- `artifacts/conon/src/pages/ProjectTimeline.tsx` — Site photo proof timeline
- `artifacts/conon/src/pages/AdminDashboard.tsx` — Admin: Map/Requests/Disputes/Payouts
- `artifacts/conon/src/components/Layout.tsx` — Header + 5-item bottom nav
- `artifacts/conon/src/components/CartSheet.tsx` — Smart cart with TruckFillIndicator
- `artifacts/conon/src/components/MandiTicker.tsx` — Live price ticker
- `artifacts/conon/src/App.tsx` — All routes
