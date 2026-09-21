# SokoWise

A community-powered platform that helps financially constrained consumers **discover, compare, and verify** affordable local product prices — including prices from sellers who have no online presence.

Built as a proof of concept for the **Andela × Open Society Foundations civic-tech hackathon** (Transparency & Accountability track). See [`SOKOWISE_CLAUDE.md`](./SOKOWISE_CLAUDE.md) for the full product specification this build follows.

> **This is a demo, not a production marketplace.** All seeded prices, sellers, and users are fictional and clearly labeled as such. No real-world current prices are implied.

---

## The core loop

```
SELLERS SHARE → COMMUNITY REPORTS → PLATFORM COMPARES → COMMUNITY VERIFIES → CONSUMERS ACT
```

A consumer searches for a product (e.g. "5L cooking oil"), sees every price reported for it across sellers, and can immediately tell:

- **How much** — the price
- **Where** — the seller and location
- **How recent** — freshness ("Reported 2 hours ago")
- **Who reported it** — seller-submitted vs. community-reported
- **Can I trust it** — a trust label (Newly reported / Community confirmed / Multiple reports / Possibly outdated / Flagged for review)
- **What next** — a highlighted **BEST VALUE** pick (price + freshness + confidence, not just the lowest number) alongside the plain **LOWEST REPORTED** price

Anyone can then confirm a price they've verified in person, flag one that looks wrong, submit a new observation for a seller who isn't listed yet, or register as a seller to manage their own listings.

Search and the product comparison page both support **Country and City filters** (dropdowns, populated from wherever there's actually an active listing — never an option that would return zero results). Country is a small curated list of African countries, not the full ISO-3166 set — a 190-option picker isn't good mobile UX for a platform with this scope. City is likewise a dropdown (not free text) at filter time, scoped to the selected country, to avoid the "Harare" vs "harare" fragmentation that free-text filtering would cause; sellers still self-report their own city/location as free text at *registration* time. This means the platform is not hardcoded to Zimbabwe — a seller in Nairobi can register and report prices in KES today with zero code changes; only the demo seed data is Zimbabwe-flavored.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** (`@theme inline` tokens, no config file)
- **PostgreSQL** via **Prisma 7** (driver-adapter pattern, `@prisma/adapter-pg`)
- **Auth.js v5** — email/password credentials, JWT sessions, `bcryptjs` hashing
- **Server Actions** for all mutations — no separate REST/API layer
- **Vitest** for unit tests
- **Docker Compose** for local Postgres

No AI dependency for this pass — search is deterministic (token-based matching over normalized product names), by design, so the app runs with zero external API keys. See [AI Search](#ai-search-not-yet-built) below.

---

## Getting started

### Prerequisites

- Node.js 20+
- Docker (for local Postgres)

### Setup

```bash
npm install
cp .env.example .env   # then fill in AUTH_SECRET (see below)
npm run db:up          # starts Postgres via Docker Compose on port 5437
npm run prisma:migrate # applies the schema
npm run db:seed        # loads demo data (see Demo Credentials below)
npm run dev
```

Open **http://localhost:3000** (or whichever port you start it on).

### Environment variables (`.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string. Defaults match `docker-compose.yml` (`postgresql://sokowise:sokowise@localhost:5437/sokowise`). |
| `AUTH_SECRET` | Random secret for signing/encrypting sessions. Generate one with `openssl rand -base64 32` (or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` on Windows). **Required** — the app won't start meaningfully without it. |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app (`http://localhost:3000` for local dev). |
| `SEED_DEMO_PASSWORD` | Password assigned to every seeded demo account. The seed script refuses to run without this set. |

### Useful scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / start |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest unit suite |
| `npm run db:up` / `npm run db:down` | Start/stop the local Postgres container |
| `npm run prisma:migrate` | Apply Prisma migrations |
| `npm run prisma:studio` | Open Prisma Studio (browse the DB) |
| `npm run db:seed` | (Re-)load demo data — idempotent, safe to re-run |

---

## Demo credentials

All seeded accounts share the password from `SEED_DEMO_PASSWORD` in your `.env` (the example file suggests `Demo1234!`).

| Email | Role | Notes |
|---|---|---|
| `admin@sokowise.test` | Admin | Access `/admin` — flag queue, seller review, activity log |
| `sunrise@sokowise.test` | Seller | Owns **Sunrise Supermarket** (verified) |
| `mbarefresh@sokowise.test` | Seller | Owns **Mbare Fresh Grocery** (verified) |
| `chitungwiza@sokowise.test` | Seller | Owns **Chitungwiza Wholesale Traders** (unverified) |
| `tendai@sokowise.test` | Community contributor | Submitted several community reports/confirmations in the seed data |
| `rufaro@sokowise.test` | Community contributor | |
| `farai@sokowise.test` | Consumer | Plain consumer account, no seller/admin capability |
| `westlands@sokowise.test` | Seller (Kenya) | Owns **Westlands Fresh Mart**, Nairobi (verified) |
| `kibera@sokowise.test` | Seller (Kenya) | Owns **Kibera Grocery Corner**, Nairobi (unverified) |
| `eastleigh@sokowise.test` | Seller (Kenya) | Owns **Eastleigh Wholesale Traders**, Nairobi (unverified) |
| `wanjiru@sokowise.test` | Community contributor (Kenya) | |
| `kiprono@sokowise.test` | Community contributor (Kenya) | |

Four sellers in the seed data are deliberately **informal — no account at all** (Mbudzi Market Stall 12 and Corner Shop Chisipite in Zimbabwe; Gikomba Market Stall 7 and Kilimani Corner Shop in Kenya), demonstrating the core premise: prices for sellers with no online presence can still be tracked, entirely from community reports.

**Kenya data** proves the platform isn't hardcoded to Zimbabwe: three genuinely Kenya-specific products (Unga/Maize Flour 2kg, Sukuma Wiki, Cooking Oil 2L) priced in **KES** across five Nairobi-area sellers, with their own BEST VALUE/LOWEST REPORTED and trust-label mini-story on the Unga product page — filter search or the product page to **Kenya** to see only this data, or to **Zimbabwe** to see only the original flagship demo untouched.

---

## A 2–3 minute demo script

This mirrors the seeded data, which was specifically crafted to walk through every trust state at once.

1. **Search** — On the home page, search "cooking oil" (or click the **Cooking Oil 5L** popular-product tile).
2. **Compare** — The product page shows 5 price reports for the same product, each demonstrating a different trust label:
   - **$11.90, Sunrise Supermarket** — ★ **BEST VALUE**, "Multiple reports" (3 confirmations)
   - **$10.80, Mbudzi Market Stall 12** (an informal seller, no account) — **LOWEST REPORTED**, "Community confirmed"
   - **$9.50, Chitungwiza Wholesale Traders** — "Flagged for review" (excluded from both badges — a flagged price never wins, no matter how low)
   - **$13.00, Corner Shop Chisipite** — "Possibly outdated" (>72h since last confirmed)
   - **$12.20, Mbare Fresh Grocery** — "Newly reported"

   Point out that BEST VALUE isn't just the lowest price — it's a weighted mix of price, freshness, and confirmation confidence.
3. **No data / conflicting data** — Search "Milk" to show the honest **"We don't have enough current price information for this product yet"** empty state. Search "Rice" to show the **conflicting-reports banner** (two prices over 50% apart).
4. **Verify** — Sign in (or register) as a consumer, confirm one of the prices, and watch its confirmation count and label update live. Try flagging one too.
5. **Sellers share** — Sign in as `sunrise@sokowise.test`, go to **My Listings**, add or update a price. Show that "updating" creates a fresh report (preserving history) rather than silently editing the old one.
6. **Moderate** — Sign in as `admin@sokowise.test`, open **Admin → Flagged Reports**, resolve the seeded Chitungwiza flag (remove or dismiss), and show it disappearing from the public product page immediately, with an entry in **Admin → Overview**'s activity log.

Closing line: *"Instead of asking five WhatsApp groups or walking around five shops, people can use community-generated information to make a more informed purchasing decision."*

---

## Architecture notes

Single Next.js app, no monorepo, no separate backend — mutations go through **Server Actions** (`lib/actions/*.ts`), not a REST API.

```
app/
  (main)/            search, product/seller pages, seller dashboard, admin — shares SiteHeader/SiteFooter
  (auth)/            sign-in, sign-up — its own centered layout, also with the shared header
lib/
  auth/              Auth.js config + session helpers (getCurrentUser/requireUser/requireAdmin)
  rbac.ts            capability-based authorization (not a role hierarchy — see below)
  trust/             the trust-label decision table (labels.ts) + freshness math
  ranking/           the BEST VALUE / LOWEST REPORTED scoring algorithm
  search/            deterministic product-name normalization + matching
  actions/           all Server Actions, grouped by domain
  validation/        zod schemas
  products/, sellers/, admin/   read-side data-assembly functions
components/          UI, grouped by domain, mirroring lib/
prisma/schema.prisma the full data model
```

### A few deliberate design decisions worth knowing about

- **Trust labels are computed at read time**, never persisted — age keeps changing, so caching a label would go stale. `ModerationStatus` (admin-driven removal state) is intentionally kept separate from the six always-recomputed trust labels.
- **A seller "updating" a price inserts a new `PriceReport` row** rather than mutating one in place, so existing confirmations/flags stay attached to the exact price they were made against. Whenever a new report is submitted for a (product, seller) pair, any prior `ACTIVE` report for that same pair is marked `REMOVED` at write time — otherwise, removing the newest report would let an older, previously-superseded price silently resurface as "current" again. (This was a real bug caught during testing, not a hypothetical.)
- **Role model is capability-based, not a hierarchy.** A user can simultaneously be a community contributor (implicit — any signed-in user) and a seller (has a linked `Seller` record) — these aren't ordered ranks, unlike the single binary `ADMIN` system role. See `lib/rbac.ts`.
- **`sellerId` is looked up fresh from the database on every request**, not cached in the session/JWT — Auth.js's `jwt` callback doesn't re-run on every plain session read, so a JWT-cached value showed stale seller status immediately after registering as a seller. One extra indexed query per request is a fine trade for correctness.

---

## AI search — not yet built

The product spec calls for natural-language search and AI-assisted product-name normalization as fast-follow (P1) features. This pass ships a **deterministic, non-AI** substitute — `lib/search/normalize.ts` and `lib/search/searchProducts.ts` — that handles the spec's own examples ("5L cooking oil" / "cooking oil 5 litre" / "five litre cooking oil") via token normalization and matching, with no external API dependency. The module boundary is deliberately isolated so an AI-backed implementation can be swapped in later without touching the rest of the app (product pages, ranking, trust labels are all decoupled from how a query gets matched to a product).

---

## Testing

- `npm test` runs the Vitest unit suite covering the trust-label decision table, the ranking algorithm (including an exact reproduction of the spec's own worked example), and product-name normalization.
- Every user-facing flow (search → compare, sign-up/sign-in, community report/confirm/flag, seller registration/pricing, admin moderation) was additionally verified end-to-end against a real running instance during development — not just unit-tested in isolation.

## What's intentionally out of scope for this pass

Per the spec's own "what not to build" list: no payments, no delivery logistics, no general-purpose chatbot, no real-time price database claims. See §19 of the spec for the full list.
