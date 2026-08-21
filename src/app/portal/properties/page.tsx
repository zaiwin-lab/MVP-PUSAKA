'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, LayoutGrid, Rows3, Search } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { NewPropertyModal } from '@/components/portal/new-property-modal';
import { PropertyImage } from '@/components/property-image';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, HealthDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { MiniStat } from '@/components/ui/stat';
import { EmptyState, TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { isVacant, scorecards } from '@/lib/metrics';
import { healthLabel, propertyStatusLabel, propertyStatusTone } from '@/lib/labels';
import { PROPERTY_TYPES } from '@/lib/public';
import { cn, formatCurrency, formatSqft } from '@/lib/utils';
import { formatDate } from '@/lib/dates';
import { downloadCsv } from '@/lib/csv';

function PropertiesInner() {
  const params = useSearchParams();
  const { data } = useStore();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [officer, setOfficer] = useState('');
  const [health, setHealth] = useState('');
  const [quick, setQuick] = useState(params.get('filter') ?? '');
  const [view, setView] = useState<'table' | 'grid'>('table');

  const cards = scorecards(data);

  const filtered = useMemo(() => {
    let list = [...cards];
    if (quick === 'occupied') list = list.filter((c) => c.property.status === 'occupied');
    if (quick === 'available') list = list.filter((c) => ['available_rent', 'available_sale'].includes(c.property.status));
    if (quick === 'vacant') list = list.filter((c) => isVacant(c.property));
    if (quick === 'arrears') list = list.filter((c) => c.outstanding > 0);
    if (type) list = list.filter((c) => c.property.type === type);
    if (status) list = list.filter((c) => c.property.status === status);
    if (officer) list = list.filter((c) => c.property.officer_id === officer);
    if (health) list = list.filter((c) => c.health === health);
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((c) =>
        `${c.property.name} ${c.property.code} ${c.property.address} ${c.property.location} ${c.property.type}`.toLowerCase().includes(needle),
      );
    }
    return list.sort((a, b) => a.property.code.localeCompare(b.property.code));
  }, [cards, quick, type, status, officer, health, q]);

  const exportCsv = () =>
    downloadCsv(
      'kopusaka-property-portfolio',
      filtered.map((c) => ({
        'Property ID': c.property.code,
        Name: c.property.name,
        Type: c.property.type,
        Location: c.property.location,
        Status: propertyStatusLabel[c.property.status],
        'Asset value (RM)': c.property.asset_value,
        'Asking rent (RM)': c.property.asking_rent ?? '',
        'Current rent (RM)': c.property.current_rent ?? '',
        'Sale price (RM)': c.property.sale_price ?? '',
        'Vacant days': c.vacantDays,
        Leads: c.leads,
        Viewings: c.viewings,
        Offers: c.offers,
        'Outstanding (RM)': c.outstanding,
        Health: healthLabel[c.health],
        Officer: data.users.find((u) => u.id === c.property.officer_id)?.name ?? '',
        'Next action': c.property.next_action,
      })),
    );

  const quickFilters = [
    { key: '', label: `All (${cards.length})` },
    { key: 'occupied', label: `Occupied (${cards.filter((c) => c.property.status === 'occupied').length})` },
    { key: 'vacant', label: `Vacant (${cards.filter((c) => isVacant(c.property)).length})` },
    { key: 'available', label: `Available (${cards.filter((c) => ['available_rent', 'available_sale'].includes(c.property.status)).length})` },
    { key: 'arrears', label: `In arrears (${cards.filter((c) => c.outstanding > 0).length})` },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Asset Management"
        title="Every Asset Must Have a Next Action."
        subtitle="The master property database — status, income, marketing activity and the next step for every asset."
        action={
          <>
            <NewPropertyModal />
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download size={14} /> Export CSV
            </Button>
            <div className="inline-flex rounded-xl border border-line bg-white p-1">
              {([{ key: 'table', icon: Rows3 }, { key: 'grid', icon: LayoutGrid }] as const).map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  aria-label={key}
                  onClick={() => setView(key)}
                  className={cn('rounded-lg p-2 transition', view === key ? 'bg-emerald-600 text-white' : 'text-ink-muted hover:bg-slate-100')}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Portfolio value" value={formatCurrency(cards.reduce((s, c) => s + c.property.asset_value, 0), { compact: true })} />
        <MiniStat label="Monthly income" value={formatCurrency(cards.reduce((s, c) => s + c.monthlyIncome, 0), { compact: true })} tone="emerald" />
        <MiniStat label="Unrealised monthly" value={formatCurrency(cards.reduce((s, c) => s + c.potentialMonthlyIncome, 0), { compact: true })} tone="gold" />
        <MiniStat label="Outstanding rental" value={formatCurrency(cards.reduce((s, c) => s + c.outstanding, 0), { compact: true })} tone="red" />
      </div>

      <Card className="mb-5">
        <CardBody className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search property, ID or address" className="h-10 pl-9" />
          </div>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-auto min-w-[140px] text-[13px]">
            <option value="">All types</option>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-auto min-w-[160px] text-[13px]">
            <option value="">All statuses</option>
            {Object.entries(propertyStatusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select value={officer} onChange={(e) => setOfficer(e.target.value)} className="h-10 w-auto min-w-[160px] text-[13px]">
            <option value="">All officers</option>
            {data.users.filter((u) => ['officer', 'property_manager'].includes(u.role)).map((u) => (
              <option key={u.id} value={u.id}>{u.name.split(' ').slice(0, 2).join(' ')}</option>
            ))}
          </Select>
          <Select value={health} onChange={(e) => setHealth(e.target.value)} className="h-10 w-auto min-w-[150px] text-[13px]">
            <option value="">Any health</option>
            <option value="green">Healthy</option>
            <option value="amber">Needs attention</option>
            <option value="red">Action required</option>
          </Select>
          <div className="flex flex-wrap gap-1.5">
            {quickFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setQuick(f.key)}
                className={cn('rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition',
                  quick === f.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200')}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No properties match these filters" detail="Clear a filter to widen the view." />
      ) : view === 'table' ? (
        <Card>
          <CardHeader title={`${filtered.length} properties`} subtitle="Health is computed from vacancy, arrears, tenancy expiry, enquiries and marketing activity" />
          <TableWrap className="min-w-full">
            <thead>
              <tr>
                <Th>Property</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th align="right">Rent / price</Th>
                <Th align="right">Vacant days</Th>
                <Th align="right">Leads</Th>
                <Th>Officer</Th>
                <Th>Next action</Th>
                <Th>Health</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <Tr key={c.property.id}>
                  <Td>
                    <Link href={`/portal/properties/${c.property.id}`} className="font-medium text-ink hover:text-emerald-700">
                      {c.property.name}
                    </Link>
                    <span className="mt-0.5 block text-[11.5px] text-ink-soft">{c.property.code} · {c.property.location}</span>
                  </Td>
                  <Td className="text-[12.5px]">{c.property.type}</Td>
                  <Td><Badge tone={propertyStatusTone[c.property.status]}>{propertyStatusLabel[c.property.status]}</Badge></Td>
                  <Td align="right">
                    {formatCurrency(c.property.current_rent ?? c.property.asking_rent ?? c.property.sale_price, { compact: true })}
                  </Td>
                  <Td align="right" className={c.vacantDays > 90 ? 'font-semibold text-red-600' : c.vacantDays > 30 ? 'font-semibold text-gold-600' : ''}>
                    {c.vacantDays || '—'}
                  </Td>
                  <Td align="right">{c.leads}</Td>
                  <Td className="text-[12.5px]">{data.users.find((u) => u.id === c.property.officer_id)?.name.split(' ').slice(0, 2).join(' ')}</Td>
                  <Td className="max-w-[210px]">
                    <span className="block truncate text-[12.5px] text-ink-muted">{c.property.next_action}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-soft">Due {formatDate(c.property.next_action_due)}</span>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-muted" title={c.healthReasons.join(' · ')}>
                      <HealthDot health={c.health} /> {healthLabel[c.health]}
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.property.id}
              href={`/portal/properties/${c.property.id}`}
              className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative aspect-[16/9]">
                <PropertyImage seed={c.property.code} type={c.property.type} view={c.property.images[0]} />
                <div className="absolute left-3 top-3">
                  <Badge tone={propertyStatusTone[c.property.status]} className="shadow-sm">{propertyStatusLabel[c.property.status]}</Badge>
                </div>
                <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm">
                  <HealthDot health={c.health} />
                </div>
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-600">{c.property.code}</p>
                <h3 className="mt-1 font-display text-[16px] font-semibold leading-snug text-ink group-hover:text-emerald-700">{c.property.name}</h3>
                <p className="mt-1 text-[12.5px] text-ink-muted">{c.property.district}, {c.property.location}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-[11.5px]">
                  <div>
                    <p className="text-ink-soft">Rent</p>
                    <p className="mt-0.5 font-semibold text-ink">{formatCurrency(c.property.current_rent ?? c.property.asking_rent, { compact: true })}</p>
                  </div>
                  <div>
                    <p className="text-ink-soft">Size</p>
                    <p className="mt-0.5 font-semibold text-ink">{formatSqft(c.property.floor_size_sqft || c.property.land_size_sqft)}</p>
                  </div>
                  <div>
                    <p className="text-ink-soft">Leads</p>
                    <p className="mt-0.5 font-semibold text-ink">{c.leads}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function PortalPropertiesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading portfolio…</p>}>
      <PropertiesInner />
    </Suspense>
  );
}
