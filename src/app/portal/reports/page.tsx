'use client';

import { Download, FileBarChart, Printer } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import {
  followupBuckets, idleAssets, leaderboard, rentalSummary, scorecards, sourcePerformance,
} from '@/lib/metrics';
import { healthLabel, leadSourceLabel, leadStageLabel, propertyStatusLabel } from '@/lib/labels';
import { downloadCsv } from '@/lib/csv';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { daysUntil, periodLabel, period } from '@/lib/dates';

export default function ReportsPage() {
  const { data } = useStore();
  const cards = scorecards(data);
  const rental = rentalSummary(data);
  const buckets = followupBuckets(data);

  const reports = [
    {
      id: 'portfolio',
      title: 'Property Portfolio Report',
      detail: 'Every property with status, value, income, health and next action.',
      rows: () =>
        cards.map((c) => ({
          'Property ID': c.property.code,
          Property: c.property.name,
          Type: c.property.type,
          Location: c.property.location,
          Status: propertyStatusLabel[c.property.status],
          'Asset value (RM)': c.property.asset_value,
          'Monthly income (RM)': c.monthlyIncome,
          'Potential monthly (RM)': c.potentialMonthlyIncome,
          'Vacant days': c.vacantDays,
          Health: healthLabel[c.health],
          Officer: data.users.find((u) => u.id === c.property.officer_id)?.name ?? '',
          'Next action': c.property.next_action,
        })),
      count: cards.length,
    },
    {
      id: 'vacancy',
      title: 'Vacancy Report',
      detail: 'Idle assets ranked by days vacant, with the income they should be earning.',
      rows: () =>
        idleAssets(data).map((c) => ({
          Property: c.property.name,
          Status: propertyStatusLabel[c.property.status],
          'Vacant days': c.vacantDays,
          'Potential monthly (RM)': c.potentialMonthlyIncome,
          'Potential annual (RM)': c.potentialMonthlyIncome * 12,
          Enquiries: c.leads,
          'Last marketing': c.property.last_marketing_activity ?? '',
          'Next action': c.property.next_action,
        })),
      count: idleAssets(data).length,
    },
    {
      id: 'income',
      title: 'Income Report',
      detail: 'Rental expected against collected for the current period, by property.',
      rows: () =>
        data.payments
          .filter((p) => p.period === period(0))
          .map((p) => ({
            Period: periodLabel(p.period),
            Property: data.properties.find((x) => x.id === p.property_id)?.name ?? '',
            'Amount due (RM)': p.amount_due,
            'Amount paid (RM)': p.amount_paid,
            'Outstanding (RM)': p.amount_due - p.amount_paid,
            'Due date': p.due_date,
            Status: p.status,
          })),
      count: data.payments.filter((p) => p.period === period(0)).length,
    },
    {
      id: 'outstanding',
      title: 'Outstanding Rental Report',
      detail: 'Every unpaid or partly paid rental record across all periods.',
      rows: () =>
        data.payments
          .filter((p) => p.amount_due - p.amount_paid > 0)
          .map((p) => ({
            Period: periodLabel(p.period),
            Property: data.properties.find((x) => x.id === p.property_id)?.name ?? '',
            Tenant: data.tenancies.find((t) => t.id === p.tenancy_id)?.tenant_company ?? '',
            'Outstanding (RM)': p.amount_due - p.amount_paid,
            'Due date': p.due_date,
            Status: p.status,
          })),
      count: data.payments.filter((p) => p.amount_due - p.amount_paid > 0).length,
    },
    {
      id: 'pipeline',
      title: 'Lead Pipeline Report',
      detail: 'The full CRM pipeline with stage, officer, value and next follow-up.',
      rows: () =>
        data.leads.map((l) => ({
          Reference: l.code,
          Prospect: l.name,
          Property: data.properties.find((p) => p.id === l.property_id)?.name ?? '',
          Stage: leadStageLabel[l.stage],
          Source: leadSourceLabel[l.source],
          Referrer: data.referrers.find((r) => r.id === l.referrer_id)?.name ?? '',
          Officer: data.users.find((u) => u.id === l.officer_id)?.name ?? '',
          'Estimated value (RM)': l.estimated_value,
          'Next follow-up': l.next_followup ?? '',
          'Last interaction': l.last_interaction,
        })),
      count: data.leads.length,
    },
    {
      id: 'referral',
      title: 'Referral Performance Report',
      detail: 'Clicks, enquiries, qualified leads and deals for every approved referrer.',
      rows: () =>
        leaderboard(data).map((r) => ({
          Code: r.referrer.code,
          Referrer: r.referrer.name,
          Type: r.referrer.referrer_type,
          Clicks: r.clicks,
          Enquiries: r.enquiries,
          Qualified: r.qualified,
          Viewings: r.viewings,
          Deals: r.deals,
          'Conversion (%)': r.conversionRate.toFixed(1),
        })),
      count: leaderboard(data).length,
    },
    {
      id: 'marketing',
      title: 'Property Marketing Performance',
      detail: 'Enquiries, viewings, offers and marketing recency per listed property.',
      rows: () =>
        cards
          .filter((c) => c.property.published)
          .map((c) => ({
            Property: c.property.name,
            'Date listed': c.property.date_listed ?? '',
            'Enquiries (total)': c.leads,
            'Enquiries (this month)': c.leadsThisMonth,
            Viewings: c.viewings,
            Offers: c.offers,
            'Days since marketing': c.daysSinceMarketing ?? '',
            Badges: c.property.badges.join(' | '),
          })),
      count: cards.filter((c) => c.property.published).length,
    },
    {
      id: 'followup',
      title: 'Officer Follow-Up Report',
      detail: 'Follow-up discipline per officer — due, overdue and stale leads.',
      rows: () =>
        data.users
          .filter((u) => ['officer', 'property_manager'].includes(u.role))
          .map((u) => {
            const b = followupBuckets(data, u.id);
            return {
              Officer: u.name,
              Role: u.title,
              'Open leads': b.pool.length,
              'Due today': b.dueToday.length,
              Overdue: b.overdue.length,
              'No activity > 3 days': b.stale.length,
              'Viewings today': b.viewingsToday.length,
            };
          }),
      count: data.users.filter((u) => ['officer', 'property_manager'].includes(u.role)).length,
    },
    {
      id: 'tenancy',
      title: 'Tenancy Expiry Report',
      detail: 'Tenancies ordered by expiry with renewal position.',
      rows: () =>
        data.tenancies.map((t) => ({
          Reference: t.code,
          Property: data.properties.find((p) => p.id === t.property_id)?.name ?? '',
          Tenant: t.tenant_company ?? t.tenant_name,
          'Monthly rent (RM)': t.monthly_rent,
          Commences: t.start_date,
          Expires: t.end_date,
          'Days to expiry': daysUntil(t.end_date),
          Renewal: t.renewal_status,
        })),
      count: data.tenancies.length,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Management reporting, one click away."
        subtitle="Every report exports as CSV for Excel. Use the browser print dialog to produce a PDF of any dashboard."
        action={<Button variant="outline" size="sm" onClick={() => window.print()}><Printer size={14} /> Print / save as PDF</Button>}
      />

      <Card className="mb-5 bg-emerald-50/50">
        <CardBody className="grid gap-4 p-5 sm:grid-cols-4">
          {[
            { label: 'Portfolio value', value: formatCurrency(cards.reduce((s, c) => s + c.property.asset_value, 0), { compact: true }) },
            { label: 'Annualised income', value: formatCurrency(rental.annualisedIncome, { compact: true }) },
            { label: 'Collection rate', value: formatPercent(rental.collectionRate) },
            { label: 'Overdue follow-ups', value: buckets.overdue.length },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">{s.label}</p>
              <p className="mt-1.5 font-display text-[24px] font-semibold leading-none text-ink">{s.value}</p>
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader title={report.title} icon={<FileBarChart size={16} />} action={<Badge tone="slate">{report.count} rows</Badge>} />
            <CardBody className="flex h-full flex-col">
              <p className="text-[13px] leading-relaxed text-ink-muted">{report.detail}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4 w-full"
                onClick={() => downloadCsv(`kopusaka-${report.id}-report`, report.rows())}
              >
                <Download size={14} /> Export CSV
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <CardHeader title="Channel summary" subtitle="Included in the referral and pipeline reports" />
        <CardBody className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {sourcePerformance(data).map((s) => (
            <div key={s.source} className="rounded-xl border border-line p-4">
              <p className="text-[12px] font-semibold text-ink">{leadSourceLabel[s.source as keyof typeof leadSourceLabel] ?? s.source}</p>
              <p className="mt-2 font-display text-[20px] font-semibold text-ink">{s.leads}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-soft">{s.qualified} qualified · {s.deals} deals</p>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
