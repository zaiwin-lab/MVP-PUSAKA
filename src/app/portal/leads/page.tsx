'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Columns3, Download, Filter, Rows3, Search } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { NewLeadModal } from '@/components/portal/new-lead-modal';
import { StageBadge, QuickContact, FollowupChip } from '@/components/portal/lead-bits';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { EmptyState, TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MiniStat } from '@/components/ui/stat';
import { useStore } from '@/lib/store';
import { followupBuckets, isOpen } from '@/lib/metrics';
import { OPEN_STAGES, leadSourceLabel, leadStageLabel, leadStages } from '@/lib/labels';
import type { Lead, LeadStage } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { daysBetween, formatDate } from '@/lib/dates';
import { downloadCsv } from '@/lib/csv';

function LeadsInner() {
  const params = useSearchParams();
  const { data, updateLeadStage } = useStore();
  const [view, setView] = useState<'board' | 'table'>('board');
  const [q, setQ] = useState('');
  const [officer, setOfficer] = useState('');
  const [source, setSource] = useState('');
  const [quick, setQuick] = useState(params.get('filter') ?? '');
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<LeadStage | null>(null);

  const buckets = followupBuckets(data);

  const leads = useMemo(() => {
    let list = [...data.leads];
    if (quick === 'overdue') list = list.filter((l) => buckets.overdue.some((x) => x.id === l.id));
    if (quick === 'today') list = list.filter((l) => buckets.dueToday.some((x) => x.id === l.id));
    if (quick === 'negotiation') list = list.filter((l) => ['negotiation', 'offer'].includes(l.stage));
    if (quick === 'referral') list = list.filter((l) => l.referrer_id);
    if (quick === 'open') list = list.filter(isOpen);
    if (officer) list = list.filter((l) => l.officer_id === officer);
    if (source) list = list.filter((l) => l.source === source);
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((l) =>
        `${l.name} ${l.company ?? ''} ${l.phone} ${l.email} ${l.code} ${l.message}`.toLowerCase().includes(needle),
      );
    }
    return list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [data.leads, quick, officer, source, q, buckets]);

  const propertyName = (id: string | null) => data.properties.find((p) => p.id === id)?.name ?? 'General enquiry';
  const officerName = (id: string | null) => data.users.find((u) => u.id === id)?.name.split(' ').slice(0, 2).join(' ') ?? 'Unassigned';

  const exportCsv = () => {
    downloadCsv(
      'kopusaka-lead-pipeline',
      leads.map((l) => ({
        Reference: l.code,
        Prospect: l.name,
        Company: l.company ?? '',
        Phone: l.phone,
        Email: l.email,
        Property: propertyName(l.property_id),
        Source: leadSourceLabel[l.source],
        Referrer: data.referrers.find((r) => r.id === l.referrer_id)?.name ?? '',
        Stage: leadStageLabel[l.stage],
        Officer: officerName(l.officer_id),
        'Estimated value (RM)': l.estimated_value,
        'Next action': l.next_action,
        'Next follow-up': l.next_followup ?? '',
        'Last interaction': l.last_interaction,
        Received: l.created_at,
      })),
    );
  };

  const quickFilters = [
    { key: '', label: `All (${data.leads.length})` },
    { key: 'open', label: `Open (${data.leads.filter(isOpen).length})` },
    { key: 'today', label: `Due today (${buckets.dueToday.length})` },
    { key: 'overdue', label: `Overdue (${buckets.overdue.length})` },
    { key: 'negotiation', label: `Negotiation (${data.leads.filter((l) => ['negotiation', 'offer'].includes(l.stage)).length})` },
    { key: 'referral', label: `Referral (${data.leads.filter((l) => l.referrer_id).length})` },
  ];

  const board = leadStages.map((stage) => ({ stage, items: leads.filter((l) => l.stage === stage) }));

  return (
    <>
      <PageHeader
        eyebrow="Lead CRM"
        title="No Enquiry Lost. No Opportunity Forgotten."
        subtitle="Every enquiry from the public site, WhatsApp, referrals and campaigns lands here with an owner, a stage and a next action."
        action={
          <>
            <NewLeadModal />
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download size={14} /> Export CSV
            </Button>
            <div className="inline-flex rounded-xl border border-line bg-white p-1">
              {([
                { key: 'board', icon: Columns3, label: 'Kanban' },
                { key: 'table', icon: Rows3, label: 'Table' },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-label={label}
                  className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition',
                    view === key ? 'bg-emerald-600 text-white' : 'text-ink-muted hover:bg-slate-100')}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MiniStat label="Open leads" value={data.leads.filter(isOpen).length} />
        <MiniStat label="Due today" value={buckets.dueToday.length} tone="gold" />
        <MiniStat label="Overdue" value={buckets.overdue.length} tone="red" />
        <MiniStat label="No activity > 3 days" value={buckets.stale.length} tone="gold" />
        <MiniStat label="Viewings today" value={buckets.viewingsToday.length} tone="emerald" />
      </div>

      <Card className="mb-5">
        <CardBody className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prospect, company, phone or reference" className="h-10 pl-9" />
          </div>
          <Select value={officer} onChange={(e) => setOfficer(e.target.value)} className="h-10 w-auto min-w-[180px] text-[13px]">
            <option value="">All officers</option>
            {data.users.filter((u) => ['officer', 'property_manager', 'super_admin'].includes(u.role)).map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
          <Select value={source} onChange={(e) => setSource(e.target.value)} className="h-10 w-auto min-w-[150px] text-[13px]">
            <option value="">All sources</option>
            {Object.entries(leadSourceLabel).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-1.5">
            {quickFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setQuick(f.key)}
                className={cn(
                  'rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition',
                  quick === f.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {leads.length === 0 ? (
        <EmptyState title="No leads match these filters" detail="Adjust the filters, or clear them to see the full pipeline." />
      ) : view === 'board' ? (
        <div className="scrollbar-slim -mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
          <div className="flex min-w-max gap-4">
            {board.map(({ stage, items }) => (
              <div
                key={stage}
                onDragOver={(e) => { e.preventDefault(); setDropTarget(stage); }}
                onDragLeave={() => setDropTarget((t) => (t === stage ? null : t))}
                onDrop={() => {
                  if (dragging) updateLeadStage(dragging, stage, 'Moved on the pipeline board');
                  setDragging(null);
                  setDropTarget(null);
                }}
                className={cn(
                  'flex w-[290px] shrink-0 flex-col rounded-2xl border bg-slate-50/70 transition-colors',
                  dropTarget === stage ? 'border-emerald-400 bg-emerald-50/70' : 'border-line',
                )}
              >
                <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
                  <p className="text-[12.5px] font-semibold text-ink">{leadStageLabel[stage]}</p>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[11.5px] font-semibold text-ink-muted ring-1 ring-inset ring-line">
                    {items.length}
                  </span>
                </div>
                <div className="scrollbar-slim flex max-h-[62vh] flex-col gap-2.5 overflow-y-auto p-3">
                  {items.map((lead) => (
                    <BoardCard
                      key={lead.id}
                      lead={lead}
                      propertyName={propertyName(lead.property_id)}
                      officerName={officerName(lead.officer_id)}
                      onDragStart={() => setDragging(lead.id)}
                      onDragEnd={() => { setDragging(null); setDropTarget(null); }}
                      dragging={dragging === lead.id}
                    />
                  ))}
                  {items.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[12px] text-ink-soft">
                      Drop a lead here
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader title={`${leads.length} leads`} subtitle="Click any row to open the full record" icon={<Filter size={16} />} />
          <TableWrap className="min-w-full">
            <thead>
              <tr>
                <Th>Prospect</Th>
                <Th>Property</Th>
                <Th>Source</Th>
                <Th>Stage</Th>
                <Th>Officer</Th>
                <Th align="right">Value</Th>
                <Th>Next follow-up</Th>
                <Th>Contact</Th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <Tr key={lead.id}>
                  <Td>
                    <Link href={`/portal/leads/${lead.id}`} className="font-medium text-ink hover:text-emerald-700">
                      {lead.name}
                    </Link>
                    <span className="mt-0.5 block text-[11.5px] text-ink-soft">
                      {lead.code} · {lead.company ?? lead.phone}
                    </span>
                  </Td>
                  <Td className="max-w-[200px] truncate">{propertyName(lead.property_id)}</Td>
                  <Td>
                    <span className="text-[12.5px]">{leadSourceLabel[lead.source]}</span>
                    {lead.referral_code ? (
                      <span className="mt-0.5 block text-[11px] text-emerald-700">{lead.referral_code}</span>
                    ) : null}
                  </Td>
                  <Td><StageBadge stage={lead.stage} /></Td>
                  <Td className="text-[12.5px]">{officerName(lead.officer_id)}</Td>
                  <Td align="right">{formatCurrency(lead.estimated_value, { compact: true })}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <FollowupChip date={lead.next_followup} />
                      <span className="text-[11.5px] text-ink-soft">{lead.next_followup ? formatDate(lead.next_followup) : ''}</span>
                    </div>
                  </Td>
                  <Td><QuickContact lead={lead} size="sm" /></Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      )}
    </>
  );
}

function BoardCard({
  lead, propertyName, officerName, onDragStart, onDragEnd, dragging,
}: {
  lead: Lead;
  propertyName: string;
  officerName: string;
  onDragStart: () => void;
  onDragEnd: () => void;
  dragging: boolean;
}) {
  const stale = daysBetween(lead.last_interaction) > 3 && OPEN_STAGES.includes(lead.stage);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'cursor-grab rounded-xl border border-line bg-white p-3.5 shadow-card transition-all active:cursor-grabbing',
        dragging && 'opacity-40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/portal/leads/${lead.id}`} className="text-[13.5px] font-semibold leading-snug text-ink hover:text-emerald-700">
          {lead.name}
        </Link>
        <FollowupChip date={lead.next_followup} />
      </div>
      <p className="mt-1 line-clamp-1 text-[12px] text-ink-muted">{propertyName}</p>
      <p className="mt-2 text-[12px] font-semibold text-ink">{formatCurrency(lead.estimated_value, { compact: true })}</p>
      <p className="mt-2 line-clamp-2 text-[11.5px] leading-snug text-ink-muted">{lead.next_action}</p>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
        <span className="flex items-center gap-1.5 text-[11px] text-ink-soft">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[9px] font-bold text-ink">
            {officerName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
          </span>
          {lead.referral_code ? <Badge tone="emerald" className="px-1.5 py-0.5 text-[9.5px]">Referral</Badge> : null}
          {stale ? <Badge tone="red" className="px-1.5 py-0.5 text-[9.5px]">Stale</Badge> : null}
        </span>
        <QuickContact lead={lead} size="sm" />
      </div>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading pipeline…</p>}>
      <LeadsInner />
    </Suspense>
  );
}
