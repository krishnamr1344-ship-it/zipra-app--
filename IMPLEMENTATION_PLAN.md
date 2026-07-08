# Zipra — Final Implementation Plan

> **Status:** Planning finalized (2026-07-09). Implementation approved to start with **Phase 1 – Critical Fixes**.
> **Note:** No prior plan artifact was found in the repository. The "Previously Confirmed Requirements" below were
> reconstructed from the features already implemented in the codebase (`app/`, `components/`, `services/`, `backend/`)
> and represent the baseline scope that must be preserved. The six Final Decisions are merged in as new work.

---

## Project Overview

**Zipra** is a grocery/food delivery marketplace:
- **Frontend:** Next.js 14 (App Router, JavaScript/JSX), Tailwind CSS, shadcn/ui-style components, Zustand, React Hook Form + Zod, Axios, Leaflet/react-leaflet (OpenStreetMap), Recharts.
- **Backend:** FastAPI + SQLAlchemy + Alembic (PostgreSQL), Firebase Admin auth, Razorpay payments, slowapi rate limiting.
- **Auth:** Firebase (email/password + Google) with a server-side session cookie; admin gated by `NEXT_PUBLIC_ADMIN_EMAIL`.
- **Mobile:** Expo app under `zipra-mobile/` (separate, not part of the production website).

---

## Previously Confirmed Requirements (preserved, unchanged)

1. **Authentication & Accounts**
   - Email/password register, login, logout, session, token refresh.
   - Google OAuth login.
   - Profile management (view/edit), About, Help pages.
   - Address book CRUD (label, type, line1/2, house/floor, city, state, pincode, landmark, lat/long, default).
   - Wishlist (add/remove, list).

2. **Catalog & Discovery**
   - Categories (list + category page).
   - Product list / detail (`product/[id]`) with images, price, MRP, rating, unit.
   - Search with filters (filter sheet).
   - Home banners (carousel), Offers page, Banners admin.
   - Product availability via `stock` (int) on the Product model; `is_deleted` soft delete.

3. **Cart & Checkout**
   - Cart page, cart items, quantity stepper, add/remove.
   - Checkout page (address selection, delivery).
   - Razorpay payment page + order-success.
   - Orders list, order detail, order tracking page.

4. **Promotions & Engagement**
   - Coupons (apply, list) + Coupons admin.
   - Notifications (user page + admin broadcast) + Notifications admin.

5. **Admin Panel**
   - Dashboard (stats), Products CRUD, Categories, Customers, Orders, Delivery Zones, Banners, Coupons, Notifications, Settings.

6. **Delivery Zones**
   - Define delivery zones; check that a delivery address falls within a serviced zone.

7. **Location / Map**
   - Map-based location selection using OpenStreetMap (Leaflet/react-leaflet) — `components/map/location-picker.jsx` and `components/location/location-picker.jsx`.

8. **Backend / API**
   - FastAPI REST: auth, profile, addresses, products, categories, cart, orders, payments, wishlist, banners, coupons, notifications, delivery_zones, admin, admin_stats.
   - PostgreSQL persistence via SQLAlchemy + Alembic migrations.
   - Firebase Admin token verification; Razorpay integration; rate limiting.

9. **Architecture / Conventions**
   - Preserve existing App Router structure, Zustand stores, services layer, component conventions, and styling system.

---

## Final Decisions (new work merged into plan)

1. **OpenStreetMap draggable pin selection** — dedicated task.
   - Flow: GPS Detect → OpenStreetMap → User drags pin → Confirm location → Save address → Check delivery zone.

2. **Frontend Out of Stock UI** — dedicated task.
   - Show "Out of Stock" badge.
   - Disable **Add to Cart**.
   - Disable **Buy Now**.
   - Automatically become available again when stock is updated (no manual toggle needed).

3. **Low Stock Alert** — dedicated task.
   - Admin-configurable threshold (default: **5**).
   - Show warning in Admin Dashboard.
   - Show low-stock count.

4. **Weather** — use **Open-Meteo API**. Do **not** use OpenWeatherMap. **No API key required**.

5. **Terms & Privacy** — create **internal pages** inside the website. Do **not** use external links.

6. Keep all previously confirmed requirements unchanged.

---

## Phase Plan

Each phase must be built, linted, and tested; production-ready before moving on. Phase 2+ require explicit approval.

### Phase 1 – Critical Fixes
Make the application build and lint cleanly and fix security/correctness gaps blocking production.
- **F1.** Fix the blocking ESLint error in `app/checkout/page.jsx` (unescaped apostrophe `react/no-unescaped-entities`) so `npm run build` passes.
- **F2.** Resolve the `<img>` ESLint warning in `components/ui/avatar.jsx` (use `next/image` or suppress intentionally) so lint is clean.
- **F3.** Fix Firebase token verification: `check_revoked=False` currently disables revocation checks (commit `d56e0f8`). Implement correct, production-safe token verification while keeping login working.
- **F4.** Reconcile stale `backend/schema.sql` (which diverges from the live SQLAlchemy models, e.g. `stock_quantity`/`is_available` vs `stock`/`is_deleted`) so it cannot mislead migrations or onboarding.
- **F5.** Verify `npm run build` and `npm run lint` pass; backend imports/starts cleanly.

### Phase 2 – Out of Stock UI & Low Stock Alert
- Out of Stock badge, disable Add to Cart / Buy Now, auto-restore on restock (decisions 2 & 3).
- Admin-configurable low-stock threshold (default 5), dashboard warning + count.

### Phase 3 – OpenStreetMap Draggable Pin Location Selection
- GPS Detect → OSM → drag pin → confirm → save address → check delivery zone (decision 1).

### Phase 4 – Weather Integration (Open-Meteo)
- Fetch weather client-side via Open-Meteo (no API key); display on relevant surface (decision 4).

### Phase 5 – Terms & Privacy Internal Pages
- Add internal `/terms` and `/privacy` pages with real content; link from footer/checkout (decision 5).

### Phase 6 – Production Repository Audit & Cleanup
- Audit root→end; remove unused folders/files/deps (old/mobile/legacy/archive/demo/experimental/dead code) only after verifying no references; fix imports; ensure build/lint pass; present final structure and removals.

---

## Verification Checklist (no confirmed requirement missing)
- [x] Auth & accounts
- [x] Catalog & discovery
- [x] Cart & checkout & payments & orders/tracking
- [x] Coupons & notifications
- [x] Admin panel
- [x] Delivery zones
- [x] Map/location (OSM)
- [x] Backend/API + DB
- [x] Architecture preserved
- [x] Decision 1: OSM draggable pin
- [x] Decision 2: Out of Stock UI
- [x] Decision 3: Low Stock Alert
- [x] Decision 4: Weather = Open-Meteo, no key
- [x] Decision 5: Terms & Privacy internal
- [x] Decision 6: confirmed requirements unchanged
