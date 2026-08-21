'use client';

import Link from 'next/link';
import { AlertTriangle, Download, Megaphone, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, HealthDot } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Stat } from '@/components/ui/stat';
import { TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { VacancyBars } from '@/components/charts';
import { useStore } from '@/lib/store';
import { idleAssets, rentalSummary } from '@/lib/metrics';
import { healthLabel, propertyStatusLabel, propertyStatusTone } from '@/lib/labels';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { formatDate } from '@/lib/dates';
import { downloadCsv } from '@/lib/csv';

export default function IdleAssetsPage() {
  const { data, recordMarketingActivity } = useStore();
  const idle = idleAssets(data);
  const rental = rentalSummary(data);
  const over90 = idle.filter((c) => c.vacantDays > 90);
  const over30 = idle.filter((c) => c.vacantDays > 30);
  const noEnquiries = idle.filter((c) => c.leadsThisMonth === 0);

  const exportCsv = () =>
    downloadCsv(
      'kopusaka-idle-asset-watchlist',
      idle.map((c) => ({
        'Property ID': c.property.code,
        Property: c.property.name,
        Location: c.property.location,
        Status: propertyStatusLabel[c.property.status],
        'Vacant days': c.vacantDays,
        'Potential monthly (RM)': c.potentialMonthlyIncome,
        'Potential annual (RM)': c.potentialMonthlyIncome * 12,
        Leads: c.leads,
        'Leads this month': c.leadsThisMonth,
        'Last marketing activity': c.property.last_marketing_activity ?? '',
        Officer: data.users.find((u) => u.id === c.property.officer_id)?.name ?? '',
        'Next action': c.property.next_action,
        Health: healthLabel[c.health],
      })),
    );

  return (
    <>
      <PageHeader
        eyebrow="Idle Asset Activation"
        title="Activate What We Already Have."
        subtitle="Every property here is earning nothing. The figures below are what the portfolio would earn if each one were let at its asking rate."
        action={<Button variant="outline" size="sm" onClick={exportCsv}><Download size={14} /> Export CSV</Button>}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Potential income currently unrealised"
          value={formatCurrency(rental.potentialMonthly)}
          sub={`${formatCurrency(rental.potentialAnnual)} annualised across ${idle.length} idle assets`}
          tone="dark"
          icon={<TrendingUp size={16} />}
          className="sm:col-span-2"
        />
        <Stat label="Vacant more than 90 days" value={formatNumber(over90.length)} sub={`${formatCurrency(over90.reduce((s, c) => s + c.potentialMonthlyIncome, 0), { compact: true })} monthly at stake`} tone="red" icon={<AlertTriangle size={16} />} />
        <Stat label="Zero enquiries this month" value={formatNumber(noEnquiries.length)} sub="Marketing attention needed" tone="gold" icon={<Megaphone size={16} />} />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader title="Days vacant" subtitle="Red bars have passed the 90-day management threshold" />
          <CardBody>
            <VacancyBars
              data={idle.map((c) => ({
                name: c.property.name.length > 22 ? `${c.property.name.slice(0, 21)}…` : c.property.name,
                days: c.vacantDays,
                potential: c.potentialMonthlyIncome,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="What activation would be worth" subtitle="Monthly and annual value of each idle asset" />
          <CardBody className="space-y-3">
            {idle.map((c) => (
              <div key={c.property.id} className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-ink">{c.property.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-soft">{c.vacantDays} days vacant · {c.leads} enquiries</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-[16px] font-semibold text-ink">{formatCurrency(c.potentialMonthlyIncome)}</p>
                  <p className="text-[11px] text-ink-soft">{formatCurrency(c.potentialMonthlyIncome * 12, { compact: true })} a year</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl bg-ink px-4 py-3.5 text-white">
              <p className="text-[13px] font-semibold">Total unrealised</p>
              <p className="font-display text-[20px] font-semibold">
                {formatCurrency(rental.potentialMonthly)}<span className="ml-1 text-[12px] font-normal text-white/60">/ month</span>
              </p>
            </div>
          </CardBody>
        </Card>
      </section>

      <Card className="mt-5">
        <CardHeader title="Idle asset watchlist" subtitle={`${idle.length} properties · ${over30.length} beyond 30 days`} />
        <TableWrap className="min-w-full">
          <thead>
            <tr>
              <Th>Property</Th>
              <Th>Status</Th>
              <Th align="right">Vacant days</Th>
              <Th align="right">Potential / month</Th>
              <Th align="right">Potential / year</Th>
              <Th align="right">Leads</Th>
              <Th>Last marketing</Th>
              <Th>Officer</Th>
              <Th>Next action</Th>
              <Th>Health</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {idle.map((c) => (
              <Tr key={c.property.id}>
                <Td>
                  <Link href={`/portal/properties/${c.property.id}`} className="font-medium text-ink hover:text-emerald-700">
                    {c.property.name}
                  </Link>
                  <span className="mt-0.5 block text-[11.5px] text-ink-soft">{c.property.code} · {c.property.location}</span>
                </Td>
                <Td><Badge tone={propertyStatusTone[c.property.status]}>{propertyStatusLabel[c.property.status]}</Badge></Td>
                <Td align="right" className={c.vacantDays > 90 ? 'font-semibold text-red-600' : c.vacantDays > 30 ? 'font-semibold text-gold-600' : ''}>
                  {c.vacantDays}
                </Td>
                <Td align="right">{formatCurrency(c.potentialMonthlyIncome)}</Td>
                <Td align="right">{formatCurrency(c.potentialMonthlyIncome * 12, { compact: true })}</Td>
                <Td align="right">{c.leads}</Td>
                <Td className="text-[12.5px]">
                  {formatDate(c.property.last_marketing_activity)}
                  {c.daysSinceMarketing !== null && c.daysSinceMarketing > 30 ? (
                    <span className="mt-0.5 block text-[11px] font-semibold text-red-600">{c.daysSinceMarketing} days ago</span>
                  ) : null}
                </Td>
                <Td className="text-[12.5px]">{data.users.find((u) => u.id === c.property.officer_id)?.name}</Td>
                <Td className="max-w-[200px] truncate text-[12.5px] text-ink-muted">{c.property.next_action}</Td>
                <Td>
                  <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-muted"><HealthDot health={c.health} /> {healthLabel[c.health]}</span>
                </Td>
                <Td>
                  <Button variant="outline" size="sm" onClick={() => recordMarketingActivity(c.property.id, 'Marketing push recorded')}>
                    Mark marketed
                  </Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <Card className="mt-5 bg-emerald-50/50">
        <CardBody className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-display text-[18px] font-semibold text-ink">See Income. See Risk. Act Earlier.</p>
            <p className="mt-1 text-[13.5px] text-ink-muted">
              Share an idle property through the referral network to widen reach beyond the website.
            </p>
          </div>
          <ButtonLink href="/portal/referrers" size="sm">Open referral network</ButtonLink>
        </CardBody>
      </Card>
    </>
  );
}
