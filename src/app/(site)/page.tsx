'use client';

import Link from 'next/link';
import {
  ArrowRight, BadgeCheck, Building2, FileSearch, Handshake, MapPin, MessageCircle, ShieldCheck, Sparkles, TrendingUp,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { PropertyCard } from '@/components/public/property-card';
import { PropertySearchBar } from '@/components/public/property-search-bar';
import { PropertyImage } from '@/components/property-image';
import { publicLocations, publicTypes } from '@/lib/public';
import { useStore } from '@/lib/store';
import type { Property, PropertyType } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { properties } from '@/lib/data/properties';

const reasons = [
  {
    icon: ShieldCheck,
    title: 'Trusted Property Owner',
    body: 'Every listing is owned and managed directly by KO-PUSAKA. No middle layers, no surprises on ownership.',
  },
  {
    icon: MapPin,
    title: 'Strategic Locations',
    body: 'Commercial, industrial and residential addresses in established catchments across Sarawak.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Enquiries',
    body: 'Your enquiry reaches the responsible officer immediately — by WhatsApp, phone or email, whichever you prefer.',
  },
  {
    icon: FileSearch,
    title: 'Transparent Information',
    body: 'Sizes, rates, availability and property ID published up front, with the date the listing was last updated.',
  },
  {
    icon: BadgeCheck,
    title: 'Easy Viewing Requests',
    body: 'Request a viewing in under a minute. An officer confirms the slot and meets you on site.',
  },
  {
    icon: TrendingUp,
    title: 'Ready to Activate',
    body: 'Units are handover-ready or fit-out ready, with clear terms and deposit structures from day one.',
  },
];

/** Ranks listings so featured, new and urgent units lead the homepage. */
function rankFeatured(list: Property[], limit: number) {
  const score = (p: Property) =>
    (p.badges.includes('featured') ? 4 : 0) +
    (p.badges.includes('new_listing') ? 2 : 0) +
    (p.badges.includes('urgent_rent') || p.badges.includes('urgent_sale') ? 1 : 0);
  return [...list].sort((a, b) => score(b) - score(a) || ((a.date_listed ?? '') < (b.date_listed ?? '') ? 1 : -1)).slice(0, limit);
}

export default function HomePage() {
  // Reads the live dataset so properties added during the demo appear here too.
  const { data } = useStore();
  const listings = data.properties.filter((p) => p.published && p.status !== 'sold' && p.status !== 'inactive');
  const featured = rankFeatured(listings, 6);
  const forRent = listings.filter((p) => p.listing_intent !== 'sale').length;
  const forSale = listings.filter((p) => p.listing_intent === 'sale').length;
  const hero = featured[0];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-emerald-50" />
          <div className="absolute -bottom-40 left-1/4 h-[320px] w-[320px] rounded-full bg-gold-50" />
        </div>

        <div className="container-page relative grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-10 lg:pt-16">
          <div className="animate-fade-up">
            <p className="eyebrow inline-flex items-center gap-2">
              <Sparkles size={13} /> From Idle Assets to Active Income
            </p>
            <h1 className="mt-4 font-display text-[36px] font-semibold leading-[1.06] tracking-tight text-ink sm:text-[46px] lg:text-[54px]">
              Turn Every Property Into an Opportunity.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-muted sm:text-[17px]">
              Discover KO-PUSAKA properties available for rent and purchase across selected locations
              in Sarawak — commercial, residential and strategic assets, listed directly by the owner.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href="/properties" size="lg">
                Explore Available Properties <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink href="/become-a-referrer" variant="outline" size="lg">
                Become a Referral Partner
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                { label: 'Properties listed', value: formatNumber(listings.length) },
                { label: 'Available to rent', value: formatNumber(forRent) },
                { label: 'Available to buy', value: formatNumber(forSale) },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">{item.label}</dt>
                  <dd className="mt-1.5 font-display text-[26px] font-semibold leading-none text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {hero ? (
            <div className="relative animate-fade-up">
              <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
                <div className="aspect-[4/3]">
                  <PropertyImage seed={hero.code} type={hero.type} view="facade" />
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-600">Featured</p>
                    <p className="mt-1 font-display text-[16px] font-semibold leading-snug text-ink">{hero.name}</p>
                    <p className="mt-0.5 text-[13px] text-ink-muted">{hero.district}, {hero.location}</p>
                  </div>
                  <ButtonLink href={`/property/${hero.slug}`} size="sm">
                    View
                  </ButtonLink>
                </div>
              </div>
              <div className="absolute bottom-[92px] left-4 hidden rounded-xl border border-line bg-white/95 px-4 py-3 shadow-lift backdrop-blur sm:block">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft">Asking rate</p>
                <p className="mt-1 font-display text-xl font-semibold text-ink">
                  {formatCurrency(hero.asking_rent ?? hero.sale_price)}
                  <span className="ml-1 text-[12px] font-medium text-ink-muted">
                    {hero.listing_intent === 'sale' ? '' : '/ month'}
                  </span>
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="container-page relative pb-14">
          <PropertySearchBar locations={publicLocations()} types={publicTypes()} />
        </div>
      </section>

      {/* ------------------------------------------------------ Featured list */}
      <section className="container-page pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Featured Properties</p>
            <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-ink sm:text-[34px]">
              Selected units, ready to move on
            </h2>
            <p className="mt-2 max-w-xl text-[15px] text-ink-muted">
              Commercial, industrial and residential assets currently open for enquiry.
            </p>
          </div>
          <ButtonLink href="/properties" variant="outline" size="sm">
            View all properties <ArrowRight size={15} />
          </ButtonLink>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- Why us */}
      <section className="container-page pt-24">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-10">
          <div className="max-w-2xl">
            <p className="eyebrow">Why Choose KO-PUSAKA</p>
            <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-ink sm:text-[34px]">
              A property owner you can deal with directly
            </h2>
          </div>
          <div className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Referral */}
      <section className="container-page pt-24">
        <div className="relative overflow-hidden rounded-2xl bg-emerald-800 p-8 text-white sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-700/60" />
          <div className="pointer-events-none absolute -bottom-24 right-24 h-72 w-72 rounded-full bg-emerald-900/40" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-300">
                <Handshake size={14} /> KO-PUSAKA Property Referral Network
              </p>
              <h2 className="mt-4 font-display text-[28px] font-semibold leading-tight tracking-tight sm:text-[36px]">
                Have someone looking for property?
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75">
                Staff, cooperative members, partners, agents and approved members of the public can
                refer tenants and buyers to KO-PUSAKA. You receive a personal referral link and QR
                code, and every enquiry that comes through it is automatically credited to you.
              </p>
              <p className="mt-4 font-display text-[19px] font-semibold text-gold-300">
                Refer. Connect. Earn Recognition.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/become-a-referrer" variant="white" size="lg">
                  Apply to become a referrer
                </ButtonLink>
                <ButtonLink href="/referrer" variant="ghost" size="lg" className="text-white hover:bg-white/10 hover:text-white">
                  Referrer dashboard <ArrowRight size={16} />
                </ButtonLink>
              </div>
            </div>

            <ol className="space-y-4">
              {[
                { step: '01', title: 'Apply and get approved', body: 'Submit a short application. KO-PUSAKA approves referrers before activation.' },
                { step: '02', title: 'Share your link or QR', body: 'Every approved referrer gets a unique link such as /r/KPS-A1023 and a downloadable QR code.' },
                { step: '03', title: 'Enquiries are credited to you', body: 'Clicks, enquiries, viewings and closed deals are tracked in your own dashboard.' },
              ].map((item) => (
                <li key={item.step} className="flex gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <span className="font-display text-[20px] font-semibold text-gold-300">{item.step}</span>
                  <div>
                    <p className="text-[14.5px] font-semibold">{item.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/70">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <p className="relative mt-8 border-t border-white/15 pt-5 text-[12px] leading-relaxed text-white/55">
            Referral recognition and any incentive remain subject to KO-PUSAKA policy approval.
            No commission rate is fixed until management determines the referral policy.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------- Browse by type */}
      <section className="container-page pt-24">
        <p className="eyebrow">Browse by category</p>
        <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-ink">
          Find the right kind of space
        </h2>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([...new Set(listings.map((p) => p.type))].sort() as PropertyType[]).map((type) => {
            const count = listings.filter((p) => p.type === type).length;
            const sample = properties.find((p) => p.type === type) ?? listings.find((p) => p.type === type)!;
            return (
              <Link
                key={type}
                href={`/properties?type=${encodeURIComponent(type)}`}
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                    <PropertyImage seed={`type-${type}`} type={type} view={sample.images[0]} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                  <div>
                    <p className="text-[14.5px] font-semibold text-ink group-hover:text-emerald-700">{type}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-muted">
                      {count} {count === 1 ? 'listing' : 'listings'}
                    </p>
                  </div>
                  <Building2 size={16} className="text-ink-soft transition-colors group-hover:text-emerald-600" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- CTA band */}
      <section className="container-page pt-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-line bg-white p-8 shadow-card sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-display text-[24px] font-semibold tracking-tight text-ink sm:text-[28px]">
              Not sure which property fits?
            </h2>
            <p className="mt-2 max-w-xl text-[14.5px] text-ink-muted">
              Tell us what you need — size, location and budget — and the KO-PUSAKA property team will
              come back with suitable options, usually the same working day.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/contact" size="lg">
              Talk to the property team
            </ButtonLink>
            <ButtonLink href="/properties" variant="outline" size="lg">
              Browse listings
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
