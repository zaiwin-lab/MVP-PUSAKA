'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft, Award, BarChart3, Handshake, Link2, MousePointerClick, Share2, TrendingUp,
} from 'lucide-react';
import { Logo } from '@/components/brand';
import { PropertyImage } from '@/components/property-image';
import { ShareTools } from '@/components/public/share-tools';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { Stat, Progress } from '@/components/ui/stat';
import { EmptyState, TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { referrerStats } from '@/lib/metrics';
import { incentiveStatusLabel, leadStageShort, propertyStatusLabel } from '@/lib/labels';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { formatDate } from '@/lib/dates';

const funnelSteps = [
  { key: 'clicks', label: 'Link clicks' },
  { key: 'enquiries', label: 'Enquiries' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'viewings', label: 'Viewings' },
  { key: 'deals', label: 'Deals closed' },
] as const;

export default function ReferrerDashboard() {
  const { data } = useStore();
  const approved = data.referrers.filter((r) => r.status === 'approved');
  const [referrerId, setReferrerId] = useState(approved[0]?.id ?? '');
  const referrer = data.referrers.find((r) => r.id === referrerId) ?? approved[0];

  if (!referrer) {
    return (
      <div className="container-page py-20">
        <EmptyState title="No approved referrers" detail="Referrer accounts are activated by KO-PUSAKA after approval." />
      </div>
    );
  }

  const stats = referrerStats(data, referrer.id);
  const promotable = data.properties.filter((p) => p.published && p.status !== 'occupied');
  const funnelValues: Record<string, number> = {
    clicks: stats.clicks,
    enquiries: stats.enquiries,
    qualified: stats.qualified,
    viewings: stats.viewings,
    deals: stats.deals,
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md">
        <div className="container-page flex h-[68px] items-center justify-between gap-4">
          <Logo href="/" />
          <div className="flex items-center gap-2">
            <Select
              value={referrerId}
              onChange={(e) => setReferrerId(e.target.value)}
              className="h-9 w-auto max-w-[190px] text-[12.5px]"
              aria-label="Demo referrer"
            >
              {approved.map((r) => (
                <option key={r.id} value={r.id}>{r.name.split(' ').slice(0, 2).join(' ')}</option>
              ))}
            </Select>
            <ButtonLink href="/properties" variant="outline" size="sm" className="hidden sm:inline-flex">
              <ArrowLeft size={14} /> Public site
            </ButtonLink>
          </div>
        </div>
      </header>

      <main className="container-page py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow inline-flex items-center gap-2"><Handshake size={13} /> Referral Partner Dashboard</p>
            <h1 className="mt-2 font-display text-[28px] font-semibold tracking-tight text-ink sm:text-[34px]">
              Welcome back, {referrer.name.split(' ')[0]}
            </h1>
            <p className="mt-1.5 text-[14px] text-ink-muted">
              Your referral code is <strong className="font-semibold text-ink">{referrer.code}</strong> · approved{' '}
              {formatDate(referrer.approved_at)}
            </p>
          </div>
          <Badge tone="emerald" dot>Approved referrer</Badge>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Link clicks" value={formatNumber(stats.clicks)} sub={`${formatNumber(stats.uniqueVisitors)} unique visitors`} icon={<MousePointerClick size={16} />} />
          <Stat label="Enquiries generated" value={stats.enquiries} sub={`${formatPercent(stats.clickToEnquiry, 1)} of your clicks`} tone="emerald" icon={<BarChart3 size={16} />} />
          <Stat label="Viewings & negotiations" value={`${stats.viewings} / ${stats.negotiations}`} sub="Progressed past first contact" />
          <Stat label="Successful deals" value={stats.deals} sub={`${formatPercent(stats.conversionRate, 1)} conversion rate`} tone="dark" icon={<TrendingUp size={16} />} />
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="min-w-0 space-y-5">
            <Card>
              <CardHeader title="Your referral link & QR" subtitle="Everything you share carries your code automatically" icon={<Link2 size={16} />} />
              <CardBody>
                <div className="mb-4 rounded-xl bg-emerald-50 p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Your short link</p>
                  <p className="mt-1 break-all font-display text-[16px] font-semibold text-ink">
                    asset.kopusaka.my/r/{referrer.code}
                  </p>
                </div>
                <ShareTools
                  url="/properties"
                  referralCode={referrer.code}
                  title="KO-PUSAKA available properties"
                  location="Sarawak"
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Your funnel" subtitle="From click to closed deal" />
              <CardBody className="space-y-3">
                {funnelSteps.map((step) => (
                  <div key={step.key}>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-ink-muted">{step.label}</span>
                      <span className="font-semibold text-ink">{formatNumber(funnelValues[step.key])}</span>
                    </div>
                    <Progress
                      className="mt-1.5"
                      value={(funnelValues[step.key] / Math.max(1, stats.clicks)) * 100}
                      tone={step.key === 'deals' ? 'emerald' : 'gold'}
                    />
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Recognition & incentive" icon={<Award size={16} />} />
              <CardBody className="space-y-3">
                {stats.rewards.length ? (
                  stats.rewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3.5">
                      <div>
                        <p className="text-[13px] font-medium text-ink">
                          {data.properties.find((p) => p.id === reward.property_id)?.name}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-ink-soft">Recorded {formatDate(reward.recorded_at)}</p>
                      </div>
                      <Badge tone={reward.status === 'paid' ? 'emerald' : reward.status === 'approved' ? 'gold' : 'slate'}>
                        {incentiveStatusLabel[reward.status]}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-[13px] text-ink-muted">No conversions recorded yet — keep sharing.</p>
                )}
                <p className="rounded-xl bg-slate-50 p-3.5 text-[12px] leading-relaxed text-ink-muted">
                  {data.settings.referral_policy_note}
                </p>
              </CardBody>
            </Card>
          </div>

          <div className="min-w-0 space-y-5">
            <Card>
              <CardHeader
                title="Properties you can promote"
                subtitle={`${promotable.length} listings currently open for enquiry`}
                icon={<Share2 size={16} />}
              />
              <CardBody className="space-y-4">
                {promotable.map((property) => (
                  <div key={property.id} className="grid gap-4 rounded-2xl border border-line p-3 sm:grid-cols-[128px_1fr]">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl sm:aspect-auto sm:h-full">
                      <PropertyImage seed={property.code} type={property.type} view={property.images[0]} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="emerald">{property.listing_intent === 'sale' ? 'For Sale' : 'For Rent'}</Badge>
                        <span className="text-[11.5px] text-ink-soft">{propertyStatusLabel[property.status]}</span>
                      </div>
                      <Link href={`/property/${property.slug}`} className="mt-1.5 font-display text-[16px] font-semibold leading-snug text-ink hover:text-emerald-700">
                        {property.name}
                      </Link>
                      <p className="mt-0.5 text-[12.5px] text-ink-muted">{property.district}, {property.location}</p>
                      <p className="mt-1.5 font-display text-[17px] font-semibold text-ink">
                        {formatCurrency(property.asking_rent ?? property.sale_price)}
                        {property.listing_intent === 'sale' ? '' : <span className="ml-1 text-[12px] font-medium text-ink-muted">/ month</span>}
                      </p>
                      <div className="mt-3">
                        <ShareTools
                          compact
                          url={`/property/${property.slug}`}
                          referralCode={referrer.code}
                          title={property.name}
                          location={property.location}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Enquiries credited to you" subtitle="Progress only — prospect contact details stay with KO-PUSAKA" />
              {stats.leads.length ? (
                <TableWrap className="min-w-full">
                  <thead>
                    <tr>
                      <Th>Reference</Th>
                      <Th>Property</Th>
                      <Th>Stage</Th>
                      <Th>Received</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.leads.map((lead) => (
                      <Tr key={lead.id}>
                        <Td className="font-medium text-ink">{lead.code}</Td>
                        <Td className="max-w-[200px] truncate text-[12.5px]">
                          {data.properties.find((p) => p.id === lead.property_id)?.name ?? 'General enquiry'}
                        </Td>
                        <Td>
                          <Badge tone={lead.stage === 'successful' ? 'emerald' : lead.stage === 'lost' ? 'red' : 'gold'}>
                            {leadStageShort[lead.stage]}
                          </Badge>
                        </Td>
                        <Td className="text-[12.5px]">{formatDate(lead.created_at)}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </TableWrap>
              ) : (
                <CardBody>
                  <EmptyState
                    title="No enquiries yet"
                    detail="Share a property link on WhatsApp to get your first enquiry. Every click through your link is tracked."
                  />
                </CardBody>
              )}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
