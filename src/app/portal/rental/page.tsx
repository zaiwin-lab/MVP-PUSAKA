'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Download, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { Stat, MiniStat, Progress } from '@/components/ui/stat';
import { TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { IncomeByTypeBars, IncomeTrend } from '@/components/charts';
import { useStore } from '@/lib/store';
import { rentalByType, rentalSummary, rentalTrend } from '@/lib/metrics';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { daysBetween, formatDate, period, periodLabel } from '@/lib/dates';
import { downloadCsv } from '@/lib/csv';

function RentalInner() {
  const params = useSearchParams();
  const { data, recordPayment } = useStore();
  const [filter, setFilter] = useState(params.get('filter') ?? '');
  const [selectedPeriod, setSelectedPeriod] = useState(period(0));

  const summary = rentalSummary(data);
  const periods = [period(0), period(-1), period(-2), period(-3)];

  const rows = useMemo(() => {
    let list = data.payments.filter((p) => p.period === selectedPeriod);
    if (filter === 'outstanding') list = list.filter((p) => p.amount_due - p.amount_paid > 0);
    if (filter === 'paid') list = list.filter((p) => p.status === 'paid');
    return list.sort((a, b) => (b.amount_due - b.amount_paid) - (a.amount_due - a.amount_paid));
  }, [data.payments, selectedPeriod, filter]);

  const propertyOf = (id: string) => data.properties.find((p) => p.id === id);
  const tenancyOf = (id: string) => data.tenancies.find((t) => t.id === id);

  const exportCsv = () =>
    downloadCsv(
      `kopusaka-rental-${selectedPeriod}`,
      rows.map((p) => ({
        Period: periodLabel(p.period),
        Property: propertyOf(p.property_id)?.name ?? '',
        Tenant: tenancyOf(p.tenancy_id)?.tenant_company ?? tenancyOf(p.tenancy_id)?.tenant_name ?? '',
        'Monthly rent (RM)': p.amount_due,
        'Amount paid (RM)': p.amount_paid,
        'Outstanding (RM)': p.amount_due - p.amount_paid,
        'Due date': p.due_date,
        'Paid date': p.paid_date ?? '',
        Status: p.status,
      })),
    );

  return (
    <>
      <PageHeader
        eyebrow="Rental & Income Monitoring"
        title="Every Ringgit Accountable."
        subtitle="Management monitoring of expected against collected rental — not an accounting ledger, but enough to see risk early."
        action={<Button variant="outline" size="sm" onClick={exportCsv}><Download size={14} /> Export CSV</Button>}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Monthly expected rental" value={formatCurrency(summary.expected, { compact: true })} sub={`${periodLabel(period(0))} contracted`} icon={<Wallet size={16} />} />
        <Stat label="Collected" value={formatCurrency(summary.collected, { compact: true })} sub={`Collection rate ${formatPercent(summary.collectionRate)}`} tone="emerald" />
        <Stat label="Outstanding" value={formatCurrency(summary.outstandingAll, { compact: true })} sub="Across all recorded periods" tone={summary.outstandingAll ? 'red' : 'default'} />
        <Stat label="Vacant income opportunity" value={formatCurrency(summary.potentialMonthly, { compact: true })} sub={`${formatCurrency(summary.potentialAnnual, { compact: true })} annualised`} tone="gold" href="/portal/idle-assets" />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Rental trend" subtitle="Expected against collected, last six months" />
          <CardBody>
            <IncomeTrend data={rentalTrend(data)} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Income by property type" subtitle="Current income stacked with unrealised potential" />
          <CardBody>
            <IncomeByTypeBars data={rentalByType(data).map((r) => ({ type: r.type, income: r.income, potential: r.potential }))} />
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader title="Collection this month" subtitle={periodLabel(period(0))} />
          <CardBody className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink-muted">Collected</span>
                <span className="font-semibold text-ink">{formatPercent(summary.collectionRate)}</span>
              </div>
              <Progress className="mt-2 h-2.5" value={summary.collectionRate} tone={summary.collectionRate > 90 ? 'emerald' : summary.collectionRate > 70 ? 'gold' : 'red'} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Expected" value={formatCurrency(summary.expected, { compact: true })} />
              <MiniStat label="Collected" value={formatCurrency(summary.collected, { compact: true })} tone="emerald" />
              <MiniStat label="Outstanding" value={formatCurrency(summary.outstanding, { compact: true })} tone="red" />
              <MiniStat label="Annualised" value={formatCurrency(summary.annualisedIncome, { compact: true })} />
            </div>
            <p className="rounded-xl bg-slate-50 p-3.5 text-[12.5px] leading-relaxed text-ink-muted">
              Rental by property is listed on the right. Marking a payment received updates the collection
              rate, the executive dashboard and the property health score immediately.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Rental by property"
            subtitle="Tenant, amount due, paid and outstanding"
            action={
              <div className="flex gap-2">
                <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="h-9 w-auto text-[12.5px]">
                  {periods.map((p) => <option key={p} value={p}>{periodLabel(p)}</option>)}
                </Select>
                <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 w-auto text-[12.5px]">
                  <option value="">All records</option>
                  <option value="outstanding">Outstanding only</option>
                  <option value="paid">Paid only</option>
                </Select>
              </div>
            }
          />
          <TableWrap className="min-w-full">
            <thead>
              <tr>
                <Th>Property</Th>
                <Th>Tenant</Th>
                <Th align="right">Monthly rent</Th>
                <Th align="right">Paid</Th>
                <Th align="right">Outstanding</Th>
                <Th>Due date</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const property = propertyOf(p.property_id);
                const tenancy = tenancyOf(p.tenancy_id);
                const outstanding = p.amount_due - p.amount_paid;
                const overdue = outstanding > 0 && daysBetween(p.due_date) > 0;
                return (
                  <Tr key={p.id}>
                    <Td>
                      <Link href={`/portal/properties/${p.property_id}`} className="font-medium text-ink hover:text-emerald-700">
                        {property?.name}
                      </Link>
                    </Td>
                    <Td className="text-[12.5px]">{tenancy?.tenant_company ?? tenancy?.tenant_name}</Td>
                    <Td align="right">{formatCurrency(p.amount_due)}</Td>
                    <Td align="right">{formatCurrency(p.amount_paid)}</Td>
                    <Td align="right" className={outstanding > 0 ? 'font-semibold text-red-600' : ''}>{formatCurrency(outstanding)}</Td>
                    <Td className="text-[12.5px]">
                      {formatDate(p.due_date)}
                      {overdue ? <span className="mt-0.5 block text-[11px] font-semibold text-red-600">{daysBetween(p.due_date)} days late</span> : null}
                    </Td>
                    <Td>
                      <Badge tone={p.status === 'paid' ? 'emerald' : p.status === 'partial' ? 'gold' : 'red'}>{p.status}</Badge>
                    </Td>
                    <Td>
                      {outstanding > 0 ? (
                        <Button variant="outline" size="sm" onClick={() => recordPayment(p.id)}>
                          <CheckCircle2 size={13} /> Mark received
                        </Button>
                      ) : null}
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </TableWrap>
        </Card>
      </section>
    </>
  );
}

export default function RentalPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading rental position…</p>}>
      <RentalInner />
    </Suspense>
  );
}
