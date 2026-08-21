'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CalendarClock, Download, FileText } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stat } from '@/components/ui/stat';
import { TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { daysUntil, formatDate } from '@/lib/dates';
import { downloadCsv } from '@/lib/csv';
import type { Tenancy } from '@/lib/types';

const renewalTone = {
  not_started: 'slate',
  in_discussion: 'gold',
  renewing: 'emerald',
  not_renewing: 'red',
  expired: 'red',
} as const;

export default function TenanciesPage() {
  const { data } = useStore();
  const [open, setOpen] = useState<Tenancy | null>(null);
  const [filter, setFilter] = useState('');

  const withDays = data.tenancies
    .map((t) => ({ tenancy: t, days: daysUntil(t.end_date), property: data.properties.find((p) => p.id === t.property_id) }))
    .sort((a, b) => a.days - b.days);

  const active = withDays.filter((r) => r.tenancy.status !== 'expired');
  const in30 = active.filter((r) => r.days >= 0 && r.days <= 30);
  const in60 = active.filter((r) => r.days >= 0 && r.days <= 60);
  const in90 = active.filter((r) => r.days >= 0 && r.days <= 90);

  const rows = filter === '30' ? in30 : filter === '60' ? in60 : filter === '90' ? in90 : withDays;

  const exportCsv = () =>
    downloadCsv(
      'kopusaka-tenancy-register',
      withDays.map((r) => ({
        Reference: r.tenancy.code,
        Property: r.property?.name ?? '',
        Tenant: r.tenancy.tenant_company ?? r.tenancy.tenant_name,
        Contact: r.tenancy.tenant_phone,
        'Monthly rent (RM)': r.tenancy.monthly_rent,
        'Deposit (RM)': r.tenancy.deposit,
        Commences: r.tenancy.start_date,
        Expires: r.tenancy.end_date,
        'Days to expiry': r.days,
        Renewal: r.tenancy.renewal_status,
        Status: r.tenancy.status,
      })),
    );

  return (
    <>
      <PageHeader
        eyebrow="Tenancy Management"
        title="Start renewal action before the tenant starts looking."
        subtitle="Every tenancy with its expiry, renewal position and deposit — with alerts at 90, 60 and 30 days."
        action={<Button variant="outline" size="sm" onClick={exportCsv}><Download size={14} /> Export CSV</Button>}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active tenancies" value={active.length} sub={`${formatCurrency(active.reduce((s, r) => s + r.tenancy.monthly_rent, 0), { compact: true })} contracted monthly`} icon={<FileText size={16} />} />
        <Stat label="Expiring within 90 days" value={in90.length} sub="Begin renewal discussion" tone={in90.length ? 'gold' : 'default'} icon={<CalendarClock size={16} />} />
        <Stat label="Expiring within 60 days" value={in60.length} sub="Confirm intention in writing" tone={in60.length ? 'gold' : 'default'} />
        <Stat label="Expiring within 30 days" value={in30.length} sub="Escalate — replacement tenant search" tone={in30.length ? 'red' : 'default'} />
      </section>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {[
          { key: '', label: `All tenancies (${withDays.length})` },
          { key: '90', label: `≤ 90 days (${in90.length})` },
          { key: '60', label: `≤ 60 days (${in60.length})` },
          { key: '30', label: `≤ 30 days (${in30.length})` },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition ${
              filter === f.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader title="Tenancy register" subtitle="Click a row to open the full record" />
        <TableWrap className="min-w-full">
          <thead>
            <tr>
              <Th>Tenant</Th>
              <Th>Property</Th>
              <Th align="right">Monthly rent</Th>
              <Th align="right">Deposit</Th>
              <Th>Commences</Th>
              <Th>Expires</Th>
              <Th>Renewal</Th>
              <Th>Alert</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ tenancy, days, property }) => (
              <Tr key={tenancy.id} onClick={() => setOpen(tenancy)}>
                <Td>
                  <span className="font-medium text-ink">{tenancy.tenant_company ?? tenancy.tenant_name}</span>
                  <span className="mt-0.5 block text-[11.5px] text-ink-soft">{tenancy.code} · {tenancy.tenant_name}</span>
                </Td>
                <Td>
                  <Link href={`/portal/properties/${tenancy.property_id}`} className="text-ink hover:text-emerald-700" onClick={(e) => e.stopPropagation()}>
                    {property?.name}
                  </Link>
                </Td>
                <Td align="right">{formatCurrency(tenancy.monthly_rent)}</Td>
                <Td align="right">{formatCurrency(tenancy.deposit)}</Td>
                <Td className="text-[12.5px]">{formatDate(tenancy.start_date)}</Td>
                <Td className="text-[12.5px]">{formatDate(tenancy.end_date)}</Td>
                <Td><Badge tone={renewalTone[tenancy.renewal_status]}>{tenancy.renewal_status.replace(/_/g, ' ')}</Badge></Td>
                <Td>
                  {tenancy.status === 'expired' ? (
                    <Badge tone="red">Expired {Math.abs(days)} days ago</Badge>
                  ) : days < 0 ? (
                    <Badge tone="red">Overdue</Badge>
                  ) : days <= 30 ? (
                    <Badge tone="red">Expires in {days} days</Badge>
                  ) : days <= 60 ? (
                    <Badge tone="gold">Expires in {days} days</Badge>
                  ) : days <= 90 ? (
                    <Badge tone="gold">Expires in {days} days</Badge>
                  ) : (
                    <span className="text-[12.5px] text-ink-soft">{days} days remaining</span>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? (open.tenant_company ?? open.tenant_name) : ''}
        subtitle={open ? `${open.code} · ${data.properties.find((p) => p.id === open.property_id)?.name}` : ''}
      >
        {open ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-[13.5px]">
              {[
                { label: 'Tenant', value: open.tenant_name },
                { label: 'Contact', value: open.tenant_phone },
                { label: 'Email', value: open.tenant_email },
                { label: 'Monthly rent', value: formatCurrency(open.monthly_rent) },
                { label: 'Deposit held', value: formatCurrency(open.deposit) },
                { label: 'Commencement', value: formatDate(open.start_date) },
                { label: 'Expiry', value: formatDate(open.end_date) },
                { label: 'Renewal status', value: open.renewal_status.replace(/_/g, ' ') },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-[11px] uppercase tracking-[0.06em] text-ink-soft">{row.label}</p>
                  <p className="mt-0.5 font-medium capitalize text-ink">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-[13px] leading-relaxed text-ink-muted">{open.notes}</div>
            <div className="space-y-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink">Documents</p>
              {open.documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5 text-[12.5px]">
                  <span className="text-ink">{doc.name}</span>
                  <span className="text-ink-soft">{doc.kind} · {doc.size}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
