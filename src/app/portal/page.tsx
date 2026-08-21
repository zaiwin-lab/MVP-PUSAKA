'use client';

import Link from 'next/link';
import {
  AlertTriangle, ArrowUpRight, Building2, CalendarClock, Contact, Handshake, Layers, TrendingUp,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { Stat, MiniStat, Progress } from '@/components/ui/stat';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, HealthDot } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { ChannelBars, FunnelBars, IncomeTrend, OccupancyDonut, VacancyBars } from '@/components/charts';
import { useStore } from '@/lib/store';
import {
  actionAlerts, funnel, idleAssets, pipelineValue, portfolioKpis, recentActivity, referralSummary,
  rentalTrend, sourcePerformance,
} from '@/lib/metrics';
import { healthLabel, leadSourceLabel, leadStageShort } from '@/lib/labels';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { relativeDays } from '@/lib/dates';

export default function ExecutiveDashboard() {
  const { data } = useStore();
  const kpi = portfolioKpis(data);
  const alerts = actionAlerts(data).slice(0, 4);
  const idle = idleAssets(data);
  const referral = referralSummary(data);
  const activity = recentActivity(data, 7);

  return (
    <>
      <PageHeader
        eyebrow="Executive Dashboard"
        title="One Screen. Every Property. Every Opportunity."
        subtitle="A central command centre for KO-PUSAKA's property portfolio, income, leads and asset activation."
        action={
          <>
            <ButtonLink href="/portal/action-centre" variant="outline" size="sm">
              <AlertTriangle size={14} /> Action Centre
            </ButtonLink>
            <ButtonLink href="/portal/reports" size="sm">Export reports</ButtonLink>
          </>
        }
      />

      {/* ------------------------------------------------------------ Top KPIs */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total properties"
          value={formatNumber(kpi.totalProperties)}
          sub={`${formatCurrency(kpi.portfolioValue, { compact: true })} estimated portfolio value`}
          icon={<Building2 size={16} />}
          href="/portal/properties"
        />
        <Stat
          label="Occupancy rate"
          value={formatPercent(kpi.occupancyRate)}
          sub={`${kpi.occupied} occupied · ${kpi.vacant} vacant or available`}
          icon={<Layers size={16} />}
          href="/portal/properties?filter=occupied"
          tone="emerald"
        />
        <Stat
          label="Monthly rental income"
          value={formatCurrency(kpi.monthlyIncome, { compact: true })}
          sub={`${formatCurrency(kpi.annualisedIncome, { compact: true })} annualised`}
          icon={<Wallet size={16} />}
          href="/portal/rental"
        />
        <Stat
          label="Unrealised monthly income"
          value={formatCurrency(kpi.potentialMonthly, { compact: true })}
          sub={`${formatCurrency(kpi.potentialAnnual, { compact: true })} a year sitting idle`}
          icon={<TrendingUp size={16} />}
          href="/portal/idle-assets"
          tone="dark"
        />
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active leads" value={formatNumber(kpi.activeLeads)} sub={`${kpi.newLeads} new · ${kpi.negotiations} in negotiation`} icon={<Contact size={16} />} href="/portal/leads" />
        <Stat label="Outstanding rental" value={formatCurrency(kpi.outstanding, { compact: true })} sub={`Collection rate ${formatPercent(kpi.collectionRate)}`} icon={<Wallet size={16} />} href="/portal/rental?filter=outstanding" tone={kpi.outstanding > 0 ? 'red' : 'default'} />
        <Stat label="Referral-generated leads" value={formatNumber(kpi.referralLeads)} sub={`${referral.activeReferrers} active referrers · ${referral.deals} closed`} icon={<Handshake size={16} />} href="/portal/referrers" />
        <Stat label="Tenancies expiring ≤ 90 days" value={formatNumber(kpi.tenanciesExpiring)} sub="Start renewal or replacement action" icon={<CalendarClock size={16} />} href="/portal/tenancies" tone={kpi.tenanciesExpiring ? 'gold' : 'default'} />
      </section>

      {/* --------------------------------------------------------- Action band */}
      <section className="mt-6">
        <Card className="border-red-100 bg-red-50/40">
          <CardHeader
            title="Action required"
            subtitle="Surfaced automatically. Every alert links straight to the records behind it."
            icon={<AlertTriangle size={17} />}
            action={<ButtonLink href="/portal/action-centre" variant="outline" size="sm">Open Action Centre</ButtonLink>}
          />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {alerts.map((alert) => (
              <Link
                key={alert.id}
                href={alert.href}
                className="group flex items-start gap-3 rounded-xl border border-line bg-white p-4 transition hover:border-emerald-300 hover:shadow-card"
              >
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-gold-400' : 'bg-emerald-500'
                  }`}
                />
                <span className="flex-1">
                  <span className="block text-[13.5px] font-semibold leading-snug text-ink">{alert.title}</span>
                  <span className="mt-1 block line-clamp-1 text-[12px] text-ink-muted">{alert.detail}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
                    {alert.cta} <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            ))}
          </CardBody>
        </Card>
      </section>

      {/* ------------------------------------------------------------- Charts */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Portfolio overview" subtitle="Occupied against vacant and available" />
          <CardBody>
            <OccupancyDonut occupied={kpi.occupied} vacant={kpi.vacant} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="Healthy" value={kpi.health.green} tone="emerald" />
              <MiniStat label="Attention" value={kpi.health.amber} tone="gold" />
              <MiniStat label="Action" value={kpi.health.red} tone="red" />
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Income overview"
            subtitle="Expected against collected rental, last six months"
            action={<ButtonLink href="/portal/rental" variant="ghost" size="sm">Rental dashboard →</ButtonLink>}
          />
          <CardBody>
            <IncomeTrend data={rentalTrend(data)} />
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              <MiniStat label="Expected this month" value={formatCurrency(rentalTrend(data).at(-1)?.expected ?? 0, { compact: true })} />
              <MiniStat label="Collected" value={formatCurrency(rentalTrend(data).at(-1)?.collected ?? 0, { compact: true })} tone="emerald" />
              <MiniStat label="Outstanding" value={formatCurrency(kpi.outstanding, { compact: true })} tone="red" />
              <MiniStat label="Collection rate" value={formatPercent(kpi.collectionRate)} />
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Vacancy — longest standing"
            subtitle="Properties earning nothing, ranked by days vacant"
            action={<ButtonLink href="/portal/idle-assets" variant="ghost" size="sm">Watchlist →</ButtonLink>}
          />
          <CardBody>
            <VacancyBars
              data={idle.slice(0, 6).map((c) => ({
                name: c.property.name.length > 22 ? `${c.property.name.slice(0, 21)}…` : c.property.name,
                days: c.vacantDays,
                potential: c.potentialMonthlyIncome,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Sales & rental pipeline"
            subtitle={`${formatCurrency(pipelineValue(data), { compact: true })} of annualised value in play`}
            action={<ButtonLink href="/portal/leads" variant="ghost" size="sm">Open CRM →</ButtonLink>}
          />
          <CardBody className="space-y-5">
            <FunnelBars data={funnel(data)} />
            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="New this month" value={kpi.newLeadsThisMonth} />
              <MiniStat label="Viewings booked" value={kpi.viewings} />
              <MiniStat label="Deals closed" value={kpi.successful} tone="emerald" />
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Referral performance"
            subtitle="Leads generated through the KO-PUSAKA referral network"
            action={<ButtonLink href="/portal/referrers" variant="ghost" size="sm">Referral network →</ButtonLink>}
          />
          <CardBody>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Clicks" value={formatNumber(referral.clicks)} />
              <MiniStat label="Enquiries" value={referral.enquiries} />
              <MiniStat label="Qualified" value={referral.qualified} />
              <MiniStat label="Deals" value={referral.deals} tone="emerald" />
            </div>
            <div className="mt-5 space-y-3">
              {referral.board.slice(0, 4).map((row, i) => (
                <div key={row.referrer.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11.5px] font-semibold text-ink">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{row.referrer.name}</p>
                    <Progress className="mt-1.5" value={(row.enquiries / Math.max(1, referral.board[0]?.enquiries ?? 1)) * 100} />
                  </div>
                  <span className="w-24 shrink-0 text-right text-[12px] text-ink-muted">
                    {row.enquiries} enquiries
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Where business comes from"
            subtitle="Leads and closed deals by channel"
            action={<ButtonLink href="/portal/campaigns" variant="ghost" size="sm">Campaigns →</ButtonLink>}
          />
          <CardBody>
            <ChannelBars
              data={sourcePerformance(data).map((s) => ({
                source: leadSourceLabel[s.source as keyof typeof leadSourceLabel] ?? s.source,
                leads: s.leads,
                deals: s.deals,
              }))}
            />
          </CardBody>
        </Card>
      </section>

      {/* ------------------------------------------------------ Recent activity */}
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Idle assets — potential income unrealised" subtitle="The commercial cost of inaction, property by property" />
          <TableWrap>
            <thead>
              <tr>
                <Th>Property</Th>
                <Th align="right">Vacant days</Th>
                <Th align="right">Potential / month</Th>
                <Th align="right">Leads</Th>
                <Th>Health</Th>
              </tr>
            </thead>
            <tbody>
              {idle.slice(0, 6).map((c) => (
                <Tr key={c.property.id}>
                  <Td>
                    <Link href={`/portal/properties/${c.property.id}`} className="font-medium text-ink hover:text-emerald-700">
                      {c.property.name}
                    </Link>
                    <span className="mt-0.5 block text-[11.5px] text-ink-soft">{c.property.location}</span>
                  </Td>
                  <Td align="right">
                    <span className={c.vacantDays > 90 ? 'font-semibold text-red-600' : c.vacantDays > 30 ? 'font-semibold text-gold-600' : ''}>
                      {c.vacantDays}
                    </span>
                  </Td>
                  <Td align="right">{formatCurrency(c.potentialMonthlyIncome)}</Td>
                  <Td align="right">{c.leads}</Td>
                  <Td>
                    <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-muted">
                      <HealthDot health={c.health} /> {healthLabel[c.health]}
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>

        <Card>
          <CardHeader title="Recent activity" subtitle="Latest enquiries, viewings and stage changes" />
          <CardBody className="space-y-4">
            {activity.map(({ activity: act, lead }) => (
              <div key={act.id} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-ink">
                    {act.summary}
                    {lead ? (
                      <>
                        {' — '}
                        <Link href={`/portal/leads/${lead.id}`} className="font-medium text-emerald-700 hover:underline">
                          {lead.name}
                        </Link>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-ink-soft">
                    {act.actor} · {relativeDays(act.created_at)}
                    {lead ? ` · ${leadStageShort[lead.stage]}` : ''}
                  </p>
                </div>
              </div>
            ))}
            <div className="hairline pt-4">
              <Badge tone="emerald">No Enquiry Lost. No Opportunity Forgotten.</Badge>
            </div>
          </CardBody>
        </Card>
      </section>
    </>
  );
}
