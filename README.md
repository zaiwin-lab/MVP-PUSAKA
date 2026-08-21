# KO-PUSAKA ASSET360

**From Idle Assets to Active Income.**

A property asset command centre, public marketplace, lead CRM and referral engine for
KO-PUSAKA — built as a working Next.js application populated with realistic demonstration
data so decision-makers can use it, not just read about it.

---

## What is in the box

### 1. Public property marketplace (`/`)
Premium, mobile-first marketplace designed to convert visitors into enquiries.

| Route | Purpose |
| --- | --- |
| `/` | Homepage — hero, property search, featured listings, referral programme |
| `/properties` | Search and filter with grid, list and map views |
| `/property/[slug]` | SEO-friendly property page built to convert (gallery, specs, enquiry form, share tools, related units) |
| `/for-rent`, `/for-sale` | Intent-filtered entry points |
| `/about`, `/contact` | Trust and contact |
| `/become-a-referrer` | Referral programme and application form |
| `/privacy`, `/terms`, `/referral-policy` | Policy pages |
| `/r/[code]` | Referral entry point — stamps attribution server-side and redirects |

Every property page carries OpenGraph metadata, a generated social preview image
(`opengraph-image`), `RealEstateListing` JSON-LD, a sticky mobile Enquire / WhatsApp bar,
and one-tap sharing to WhatsApp, Facebook and LinkedIn with a downloadable QR code.

### 2. Management portal (`/portal`)
| Route | Purpose |
| --- | --- |
| `/portal` | Executive dashboard — 16 KPIs, portfolio, income, vacancy, pipeline, referral and activity |
| `/portal/officer` | Officer's day — new leads, follow-ups due and overdue, viewings, tenancy actions |
| `/portal/action-centre` | Priority actions surfaced automatically, each linked to its records |
| `/portal/properties` | Master property database (table and card views, CSV export) |
| `/portal/properties/[id]` | Per-property scorecard — health, income, marketing, leads, ledger, status controls |
| `/portal/idle-assets` | Idle asset watchlist and *potential income currently unrealised* |
| `/portal/rental` | Rental and income monitoring — expected, collected, outstanding, collection rate |
| `/portal/tenancies` | Tenancy register with 90 / 60 / 30-day expiry alerts |
| `/portal/leads` | Lead CRM — drag-and-drop Kanban and table view |
| `/portal/leads/[id]` | Lead record — timeline, stage tracker, notes, follow-ups, assignment |
| `/portal/referrers` | Referral network governance, leaderboard and incentive register |
| `/portal/referrers/[id]` | Referrer record — funnel, attributed leads, link and QR |
| `/portal/campaigns` | Campaign link builder and channel performance |
| `/portal/reports` | Nine management reports, all exportable to CSV |
| `/portal/admin` | Users, roles, referral settings, taxonomies, data and integrations |

### 3. Referrer dashboard (`/referrer`)
Mobile-friendly partner view: referral link, QR code, share-ready properties, funnel from
click to closed deal, attributed enquiries (progress only — prospect contact details stay
with KO-PUSAKA) and incentive status.

---

## Everything is connected

```
Public visitor → property page → enquiry / WhatsApp / viewing request
   → lead created in CRM (referral attribution captured)
      → officer assigned → follow-up → viewing → negotiation
         → agreement → property status becomes Occupied
            → rental income monitored → referral credit recorded
```

Moving a lead to **negotiation**, **agreement** or **successful** updates the property status,
the occupancy rate, the income figures and — where a referrer is attributed — creates an
incentive record. Submitting an enquiry on the public site makes it appear in the CRM
immediately.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

Node 20+ recommended. Copy `.env.example` to `.env.local` to set the public site URL and
WhatsApp number.

---

## Demo data

The prototype ships with a coherent, realistic dataset:

- **15 properties** across Kuching, Kota Samarahan, Sibu, Bintulu, Miri, Serian and Mukah —
  6 occupied, 4 available for rent, 2 for sale, 2 under negotiation, 1 reserved
- **20 leads** spread across all ten pipeline stages, with activity timelines
- **5 referrers** (4 approved, 1 pending), with clicks, attributions and incentive records
- **8 tenancies**, including expiries at 24, 52 and 58 days and one expired tenancy that
  explains the portfolio's longest vacancy
- **Rental ledger** for four periods with arrears, a partial payment and a late payment
- **9 viewings, 4 offers, 8 campaigns, 6 users** across every role

Dates are anchored to the day the app loads, so follow-ups due "today" really are due today
and the demo never goes stale. Every change you make — new enquiries, stage moves, status
updates, approvals — persists in the browser for the session. **Reset demo data** in the
portal sidebar restores the seed.

---

## Architecture

```
src/
  app/
    (site)/            public marketplace
    portal/            management portal
    referrer/          referral partner dashboard
    r/[code]/          referral redirect + attribution cookie
  components/
    ui/                design-system primitives (button, card, badge, field, table, modal, stat)
    public/            marketplace components
    portal/            portal components
    charts/            Recharts wrappers
    property-image.tsx deterministic SVG property artwork
  lib/
    types.ts           domain model (mirrors the SQL schema)
    data/              seeded demo dataset
    dataset.ts         dataset assembly
    store.tsx          client store — actions, persistence, role switching
    metrics.ts         KPIs, health scoring, funnels, alerts, notifications
    referral.ts        attribution capture
supabase/schema.sql    PostgreSQL schema, views and row-level security
```

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Recharts · Lucide ·
`qrcode.react`. Components in the style of shadcn/ui, hand-written so there is no
generated-component sprawl.

### Attaching Supabase

No component reads storage directly — everything goes through the dataset and the store, so
connecting Supabase is a data-source swap:

1. Run `supabase/schema.sql` against your project.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
3. Replace the loaders in `src/lib/dataset.ts` with Supabase queries, and the mutations in
   `src/lib/store.tsx` with inserts and updates. Types in `src/lib/types.ts` already match
   the tables one-for-one.
4. Move property images to Supabase Storage and swap `PropertyImage` for `next/image`.

Row-level security policies for every role — including anonymous read of published listings
and anonymous enquiry insert — are already written in the schema.

---

## Design notes

- **Palette:** near-white canvas, deep emerald accent, charcoal text, restrained gold —
  chosen to suit board, GLC and senior government audiences.
- **Typography:** Fraunces for display figures and headings, Inter for interface text.
- **Imagery:** property artwork is generated as deterministic SVG per property, type and
  view. It never 404s, loads instantly, and is replaced one-for-one with real photography
  when it is uploaded.
- **Property health:** every asset is scored green / amber / red from vacancy duration,
  arrears, tenancy expiry, enquiry volume and marketing recency. Thresholds live in system
  settings, not in code.
- **Referral policy:** no commission rate is hard-coded anywhere. The incentive model is a
  setting with four eligibility states — pending, approved, paid, rejected — so KO-PUSAKA can
  determine policy later without a code change.

---

*Every Asset Visible. Every Opportunity Actionable. Every Ringgit Accountable.*
