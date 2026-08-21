import type { Metadata } from 'next';
import { Building2, HandCoins, LineChart, ShieldCheck, Target, Users } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { PropertyImage } from '@/components/property-image';
import { publicProperties } from '@/lib/public';
import { properties } from '@/lib/data/properties';
import { formatCurrency, formatNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About KO-PUSAKA',
  description:
    'KO-PUSAKA owns and manages a portfolio of commercial, industrial, residential and strategic properties across Sarawak, listed and let directly by the owner.',
  alternates: { canonical: '/about' },
};

const pillars = [
  { icon: Building2, title: 'Own the asset', body: 'A portfolio of shoplots, offices, warehouses, homes and development land held across Sarawak.' },
  { icon: Target, title: 'Activate the asset', body: 'Every vacant unit carries an owner, a next action and a deadline. Nothing sits quietly in a spreadsheet.' },
  { icon: LineChart, title: 'Account for the asset', body: 'Rental income, collection and vacancy are monitored monthly against the potential the portfolio should be earning.' },
];

export default function AboutPage() {
  const listings = publicProperties();
  const portfolioValue = properties.reduce((s, p) => s + p.asset_value, 0);

  return (
    <>
      <section className="border-t border-line bg-white">
        <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow">About KO-PUSAKA</p>
            <h1 className="mt-3 font-display text-[34px] font-semibold leading-tight tracking-tight text-ink sm:text-[44px]">
              Every asset visible. Every opportunity actionable.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-muted">
              KO-PUSAKA holds property on behalf of its members and stakeholders. Our responsibility is
              not simply to keep those assets — it is to keep them working. Asset360 is the platform we
              use to market every available unit, capture every enquiry, and account for every ringgit
              of rental the portfolio should be earning.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/properties" size="lg">Explore available properties</ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg">Speak to the team</ButtonLink>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['facade', 'interior', 'aerial', 'frontage'].map((view, i) => (
              <div key={view} className={`overflow-hidden rounded-2xl border border-line shadow-card ${i % 2 ? 'mt-8' : ''}`}>
                <div className="aspect-[4/3]">
                  <PropertyImage seed={`about-${view}`} type={i % 2 ? 'Office' : 'Shoplot'} view={view} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Properties under management', value: formatNumber(properties.length) },
            { label: 'Estimated portfolio value', value: formatCurrency(portfolioValue, { compact: true }) },
            { label: 'Currently open for enquiry', value: formatNumber(listings.length) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">{stat.label}</p>
              <p className="mt-3 font-display text-[34px] font-semibold leading-none text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon size={19} />
              </span>
              <h2 className="mt-4 font-display text-[19px] font-semibold text-ink">{title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="rounded-2xl border border-line bg-white p-8 shadow-card sm:p-12">
          <p className="eyebrow">How we work with you</p>
          <h2 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-ink">
            Direct dealing, from first enquiry to keys
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              { icon: Users, title: 'One responsible officer', body: 'Each property has a named officer. Your enquiry is assigned immediately and tracked until it is resolved.' },
              { icon: ShieldCheck, title: 'Clear, published information', body: 'Sizes, rates, availability and property IDs are published up front, with the date the listing was last reviewed.' },
              { icon: HandCoins, title: 'Straightforward commercial terms', body: 'Rental, deposit and term are discussed openly. Fit-out and staged arrangements are considered on merit.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <Icon size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
