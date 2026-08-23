# KOPUSAKA Asset360

> **Maturity:** Working public demonstration · browser-local operational prototype with a Supabase-ready schema

KOPUSAKA Asset360 is a property portfolio command centre that combines a public marketplace, internal asset oversight, lead management and referral tracking in one product concept.

**Live demonstration:** [kopusaka-asset360.netlify.app](https://kopusaka-asset360.netlify.app/)

## Business problem

Property-owning organisations can lose income when asset records, vacancy status, enquiries, tenancy actions and referral activity are scattered across spreadsheets and individual conversations. Asset360 explores a shared workflow that makes every asset visible and turns idle-property information into prioritised action.

## Intended users

- Property and asset managers
- Management and board reviewers
- Leasing, sales and enquiry officers
- Finance viewers monitoring rental performance
- Approved referral partners
- Prospective tenants and purchasers using the public marketplace

## Demonstrated capabilities

- Public property search, filters, listing pages and enquiry journeys
- Rent, sale and property-detail entry points with share links and QR codes
- Management dashboard covering portfolio, vacancy, income, pipeline and activity
- Property records, health indicators, idle-asset watchlists and CSV export
- Lead CRM with stages, follow-ups, activity history and officer assignment
- Tenancy and rental-ledger presentation with expiry and arrears indicators
- Referral-code attribution, referrer views and incentive-status workflows
- Campaign-link builder, reports and role-oriented navigation
- Responsive public, staff and referrer experiences

## Strategic value

The platform connects public demand generation with internal asset decisions. It demonstrates how a cooperative or institutional property owner could progress from a static asset register toward an accountable operating system for vacancy reduction, enquiry follow-up, rental visibility and governed referrals.

## What is actually implemented

The current public build is a realistic demonstration environment. Its seeded properties, leads, tenancies, users, campaigns, payments and performance figures are **sample data**, not a record of KOPUSAKA’s real portfolio or results.

Application interactions use a React store backed by browser `localStorage`. Enquiries, stage changes, property updates and referral activity can therefore be tested locally in the browser, but they are not transmitted to an organisational database.

A detailed PostgreSQL/Supabase schema is included with role definitions and Row Level Security policies. It is an implementation foundation, not evidence that the live demonstration is connected to Supabase.

No generative-AI or autonomous decision engine is implemented. Property health and priority indicators are deterministic calculations intended to support—not replace—human review.

## Technology

- Next.js 15 App Router, React 19 and TypeScript
- Tailwind CSS and reusable interface components
- Recharts for visual reporting
- Browser-local demonstration store and seeded dataset
- PostgreSQL/Supabase schema with prepared roles and RLS policies
- Netlify static/server rendering integration
- QR-code generation and CSV exports

## Delivery role

**Ts. Zaiwin Kassim** leads product framing, property-workflow architecture, stakeholder alignment and supervised AI-assisted delivery with the **KOBIS AI Prodigy Team**. This repository demonstrates product and solution-delivery capability; it does not claim implementation, adoption, asset ownership or commercial outcomes on behalf of KOPUSAKA.

## Responsible-use boundaries

- All displayed assets, people, organisations, values, rental figures, leads and performance metrics must be treated as demonstration data unless verified against an authorised source.
- A public prototype does not establish commissioning, endorsement, partnership or production use by KOPUSAKA or another organisation.
- Financial indicators are management aids, not audited accounts, valuations, investment advice or legal determinations.
- Referral eligibility and payments require an approved written policy, identity checks, anti-fraud controls, tax treatment and human authorisation.
- Production handling of enquiries, identity information, tenancy records and payment data requires privacy notices, consent, role-based access, encryption, backups, retention rules and audit monitoring.
- Public enquiry insertion must include abuse prevention, validation and rate limiting before operational launch.
- Property status, health scores and automated priority flags must remain reviewable and correctable by authorised staff.

## Current limitations

- The live demonstration uses browser-local data rather than a shared production database.
- Persona switching demonstrates navigation and workflows; it is not production authentication.
- Supabase connection, storage, audit operations and organisational user provisioning remain implementation work.
- Property imagery is generated demonstration artwork.
- No verified integration with accounting, payment, tenancy-document, mapping or messaging systems is evidenced.
- Automated tests, security testing, user acceptance and production monitoring are not evidenced in this repository.

## Key routes

| Area | Examples |
|---|---|
| Public marketplace | `/`, `/properties`, `/property/[slug]`, `/for-rent`, `/for-sale` |
| Management | `/portal`, `/portal/properties`, `/portal/leads`, `/portal/rental`, `/portal/reports` |
| Referrals | `/become-a-referrer`, `/r/[code]`, `/referrer` |

## Run locally

```bash
npm install
npm run dev
npm run typecheck
```

## Portfolio evidence

Asset360 demonstrates end-to-end service design, property-domain modelling, multi-role workflow architecture, analytics, referral attribution and responsible separation between a persuasive product demonstration and a production asset system.
