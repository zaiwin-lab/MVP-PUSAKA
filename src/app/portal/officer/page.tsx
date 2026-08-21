'use client';

import Link from 'next/link';
import { CalendarClock, ClipboardList, Contact, Home, Sunrise } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { FollowupChip, QuickContact, StageBadge } from '@/components/portal/lead-bits';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, HealthDot } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Stat } from '@/components/ui/stat';
import { EmptyState, TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { followupBuckets, scorecards } from '@/lib/metrics';
import { healthLabel, propertyStatusLabel } from '@/lib/labels';
import { formatCurrency } from '@/lib/utils';
import { daysUntil, formatDate, formatDateTime } from '@/lib/dates';

export default function OfficerDashboard() {
  const { data, currentUserId } = useStore();
  const officer = data.users.find((u) => u.id === currentUserId) ?? data.users[3];
  const buckets = followupBuckets(data, officer.id);
  const myProperties = scorecards(data).filter((c) => c.property.officer_id === officer.id);
  const myLeads = data.leads.filter((l) => l.officer_id === officer.id);
  const myTenancies = data.tenancies.filter(
    (t) => myProperties.some((p) => p.property.id === t.property_id) && t.status !== 'expired' && daysUntil(t.end_date) <= 90,
  );
  const propertiesNeedingUpdate = myProperties.filter(
    (c) => c.property.next_action_due && daysUntil(c.property.next_action_due) <= 0,
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageHeader
        eyebrow="Officer Dashboard"
        title={`${greeting}, ${officer.name.split(' ')[1] ?? officer.name.split(' ')[0]}`}
        subtitle={`${officer.title} · Here is everything waiting for you today.`}
        action={<ButtonLink href="/portal/leads" size="sm"><Contact size={14} /> Open my pipeline</ButtonLink>}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="New leads" value={myLeads.filter((l) => l.stage === 'new').length} icon={<Sunrise size={16} />} href="/portal/leads" />
        <Stat label="Follow-ups due" value={buckets.dueToday.length} tone={buckets.dueToday.length ? 'gold' : 'default'} href="/portal/leads?filter=today" />
        <Stat label="Overdue" value={buckets.overdue.length} tone={buckets.overdue.length ? 'red' : 'default'} href="/portal/leads?filter=overdue" />
        <Stat label="Viewings today" value={buckets.viewingsToday.length} icon={<CalendarClock size={16} />} />
        <Stat label="Tenancy actions" value={myTenancies.length} href="/portal/tenancies" />
        <Stat label="Property updates" value={propertiesNeedingUpdate.length} tone={propertiesNeedingUpdate.length ? 'gold' : 'default'} href="/portal/properties" />
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="My next actions" subtitle="Ordered by urgency — overdue first" icon={<ClipboardList size={16} />} />
            {[...buckets.overdue, ...buckets.dueToday, ...buckets.pool.filter((l) => !buckets.overdue.includes(l) && !buckets.dueToday.includes(l))].length ? (
              <TableWrap className="min-w-full">
                <thead>
                  <tr>
                    <Th>Prospect</Th>
                    <Th>Property</Th>
                    <Th>Stage</Th>
                    <Th>Next action</Th>
                    <Th>Due</Th>
                    <Th>Contact</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...buckets.overdue,
                    ...buckets.dueToday,
                    ...buckets.pool.filter((l) => !buckets.overdue.includes(l) && !buckets.dueToday.includes(l)),
                  ]
                    .slice(0, 12)
                    .map((lead) => (
                      <Tr key={lead.id}>
                        <Td>
                          <Link href={`/portal/leads/${lead.id}`} className="font-medium text-ink hover:text-emerald-700">{lead.name}</Link>
                          <span className="mt-0.5 block text-[11.5px] text-ink-soft">{lead.code}</span>
                        </Td>
                        <Td className="max-w-[170px] truncate text-[12.5px]">
                          {data.properties.find((p) => p.id === lead.property_id)?.name ?? 'General enquiry'}
                        </Td>
                        <Td><StageBadge stage={lead.stage} /></Td>
                        <Td className="max-w-[210px] truncate text-[12.5px] text-ink-muted">{lead.next_action}</Td>
                        <Td><FollowupChip date={lead.next_followup} /></Td>
                        <Td><QuickContact lead={lead} size="sm" /></Td>
                      </Tr>
                    ))}
                </tbody>
              </TableWrap>
            ) : (
              <CardBody><EmptyState title="Nothing outstanding" detail="Every lead assigned to you has a future follow-up date." /></CardBody>
            )}
          </Card>

          <Card>
            <CardHeader title="My properties" subtitle={`${myProperties.length} assets under your care`} icon={<Home size={16} />} />
            <TableWrap className="min-w-full">
              <thead>
                <tr>
                  <Th>Property</Th>
                  <Th>Status</Th>
                  <Th align="right">Income</Th>
                  <Th align="right">Vacant days</Th>
                  <Th>Next action</Th>
                  <Th>Health</Th>
                </tr>
              </thead>
              <tbody>
                {myProperties.map((c) => (
                  <Tr key={c.property.id}>
                    <Td>
                      <Link href={`/portal/properties/${c.property.id}`} className="font-medium text-ink hover:text-emerald-700">{c.property.name}</Link>
                      <span className="mt-0.5 block text-[11.5px] text-ink-soft">{c.property.code}</span>
                    </Td>
                    <Td className="text-[12.5px]">{propertyStatusLabel[c.property.status]}</Td>
                    <Td align="right">{formatCurrency(c.monthlyIncome || c.potentialMonthlyIncome, { compact: true })}</Td>
                    <Td align="right">{c.vacantDays || '—'}</Td>
                    <Td className="max-w-[200px] truncate text-[12.5px] text-ink-muted">{c.property.next_action}</Td>
                    <Td><span className="inline-flex items-center gap-2 text-[12.5px] text-ink-muted"><HealthDot health={c.health} /> {healthLabel[c.health]}</span></Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          </Card>
        </div>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Today's viewings" icon={<CalendarClock size={16} />} />
            <CardBody className="space-y-3">
              {buckets.viewingsToday.length ? (
                buckets.viewingsToday.map((v) => {
                  const lead = data.leads.find((l) => l.id === v.lead_id);
                  return (
                    <div key={v.id} className="rounded-xl border border-line p-4">
                      <p className="text-[13.5px] font-semibold text-ink">{formatDateTime(v.scheduled_at)}</p>
                      <p className="mt-1 text-[12.5px] text-ink-muted">
                        {data.properties.find((p) => p.id === v.property_id)?.name}
                      </p>
                      {lead ? (
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <Link href={`/portal/leads/${lead.id}`} className="text-[12.5px] font-medium text-emerald-700">{lead.name}</Link>
                          <QuickContact lead={lead} size="sm" />
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <p className="text-[13px] text-ink-muted">No viewings scheduled for today.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Tenancy actions" subtitle="Expiring within 90 days on your properties" />
            <CardBody className="space-y-3">
              {myTenancies.length ? (
                myTenancies.map((t) => (
                  <div key={t.id} className="flex items-start justify-between gap-3 rounded-xl border border-line p-3.5">
                    <div>
                      <p className="text-[13px] font-medium text-ink">{t.tenant_company ?? t.tenant_name}</p>
                      <p className="mt-0.5 text-[11.5px] text-ink-soft">
                        {data.properties.find((p) => p.id === t.property_id)?.name} · expires {formatDate(t.end_date)}
                      </p>
                    </div>
                    <Badge tone={daysUntil(t.end_date) <= 30 ? 'red' : 'gold'}>{daysUntil(t.end_date)}d</Badge>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-ink-muted">No tenancy actions in the next 90 days.</p>
              )}
            </CardBody>
          </Card>

          <Card className="bg-emerald-50/50">
            <CardBody className="space-y-2 p-5">
              <p className="font-display text-[16px] font-semibold text-ink">No lead is ever forgotten</p>
              <p className="text-[13px] leading-relaxed text-ink-muted">
                Leads with no interaction for more than {data.settings.followup_stale_days} days are flagged
                automatically. You currently have <strong className="text-ink">{buckets.stale.length}</strong> in
                that state.
              </p>
              <ButtonLink href="/portal/leads?filter=overdue" variant="outline" size="sm" className="mt-2">
                Review stale leads
              </ButtonLink>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
