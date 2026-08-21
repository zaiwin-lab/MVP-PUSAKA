'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Handshake, Link2, MousePointerClick } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { StageBadge } from '@/components/portal/lead-bits';
import { ShareTools } from '@/components/public/share-tools';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Stat } from '@/components/ui/stat';
import { EmptyState, TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { referrerStats } from '@/lib/metrics';
import { incentiveStatusLabel, referrerStatusLabel } from '@/lib/labels';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { formatDate } from '@/lib/dates';

export default function ReferrerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, setReferrerStatus } = useStore();
  const referrer = data.referrers.find((r) => r.id === id);

  if (!referrer) {
    return <EmptyState title="Referrer not found" action={<ButtonLink href="/portal/referrers" size="sm" className="mt-3">Back to network</ButtonLink>} />;
  }

  const stats = referrerStats(data, referrer.id);

  return (
    <>
      <Link href="/portal/referrers" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition hover:text-emerald-700">
        <ArrowLeft size={14} /> Back to referral network
      </Link>

      <PageHeader
        eyebrow={`Referrer ${referrer.code}`}
        title={referrer.name}
        subtitle={`${referrer.organisation ?? referrer.occupation} · ${referrer.phone} · ${referrer.email}`}
        action={
          <>
            <Badge tone={referrer.status === 'approved' ? 'emerald' : referrer.status === 'pending' ? 'gold' : 'red'}>
              {referrerStatusLabel[referrer.status]}
            </Badge>
            {referrer.status !== 'approved' ? (
              <Button size="sm" onClick={() => setReferrerStatus(referrer.id, 'approved')}>Approve referrer</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setReferrerStatus(referrer.id, 'suspended')}>Suspend</Button>
            )}
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Clicks" value={formatNumber(stats.clicks)} sub={`${formatNumber(stats.uniqueVisitors)} unique visitors`} icon={<MousePointerClick size={16} />} />
        <Stat label="Enquiries" value={stats.enquiries} sub={`${formatPercent(stats.clickToEnquiry, 1)} click-to-enquiry`} tone="emerald" />
        <Stat label="Qualified / viewings" value={`${stats.qualified} / ${stats.viewings}`} sub={`${stats.negotiations} in negotiation`} />
        <Stat label="Successful deals" value={stats.deals} sub={`${formatPercent(stats.conversionRate, 1)} conversion rate`} tone="emerald" />
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-5">
          <Card>
            <CardHeader title={`Attributed leads (${stats.leads.length})`} subtitle="Every enquiry captured through this referral link" />
            {stats.leads.length ? (
              <TableWrap className="min-w-full">
                <thead>
                  <tr>
                    <Th>Prospect</Th>
                    <Th>Property</Th>
                    <Th>Stage</Th>
                    <Th align="right">Value</Th>
                    <Th>Received</Th>
                  </tr>
                </thead>
                <tbody>
                  {stats.leads.map((lead) => (
                    <Tr key={lead.id}>
                      <Td>
                        <Link href={`/portal/leads/${lead.id}`} className="font-medium text-ink hover:text-emerald-700">{lead.name}</Link>
                        <span className="mt-0.5 block text-[11.5px] text-ink-soft">{lead.code}</span>
                      </Td>
                      <Td className="max-w-[200px] truncate text-[12.5px]">
                        {data.properties.find((p) => p.id === lead.property_id)?.name ?? 'General enquiry'}
                      </Td>
                      <Td><StageBadge stage={lead.stage} /></Td>
                      <Td align="right">{formatCurrency(lead.estimated_value, { compact: true })}</Td>
                      <Td className="text-[12.5px]">{formatDate(lead.created_at)}</Td>
                    </Tr>
                  ))}
                </tbody>
              </TableWrap>
            ) : (
              <CardBody><EmptyState title="No enquiries yet" detail="This referrer has not generated an enquiry so far." /></CardBody>
            )}
          </Card>

          <Card>
            <CardHeader title="Incentive record" subtitle="Eligibility only — value set by KO-PUSAKA policy" />
            <CardBody className="space-y-3">
              {stats.rewards.length ? (
                stats.rewards.map((reward) => (
                  <div key={reward.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
                    <div>
                      <p className="text-[13.5px] font-medium text-ink">
                        {data.properties.find((p) => p.id === reward.property_id)?.name}
                      </p>
                      <p className="mt-0.5 text-[12px] text-ink-muted">
                        Deal value {formatCurrency(reward.deal_value)} · recorded {formatDate(reward.recorded_at)}
                      </p>
                    </div>
                    <Badge tone={reward.status === 'paid' ? 'emerald' : reward.status === 'approved' ? 'gold' : 'slate'}>
                      {incentiveStatusLabel[reward.status]}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-ink-muted">No incentive records yet.</p>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Referral link & QR" icon={<Link2 size={16} />} />
            <CardBody>
              <ShareTools
                url={`/properties`}
                referralCode={referrer.code}
                title="KO-PUSAKA available properties"
                location="Sarawak"
              />
              <p className="mt-3 rounded-xl bg-slate-50 p-3.5 text-[12px] leading-relaxed text-ink-muted">
                Short link: <strong className="font-semibold text-ink">/r/{referrer.code}</strong> — stamps
                attribution server-side and holds it for {data.settings.attribution_window_days} days.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Application record" icon={<Handshake size={16} />} />
            <CardBody className="space-y-2.5 text-[13px]">
              {[
                { label: 'Referral code', value: referrer.code },
                { label: 'IC / ID', value: referrer.id_number },
                { label: 'Occupation', value: referrer.occupation },
                { label: 'Type', value: referrer.referrer_type },
                { label: 'Applied', value: formatDate(referrer.created_at) },
                { label: 'Approved', value: referrer.approved_at ? `${formatDate(referrer.approved_at)} by ${referrer.approved_by}` : 'Not yet approved' },
                { label: 'Bank details', value: referrer.bank_placeholder ?? 'Not provided' },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 border-b border-line/70 pb-2 last:border-0">
                  <span className="text-[12px] text-ink-muted">{row.label}</span>
                  <span className="text-right font-medium capitalize text-ink">{row.value}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
