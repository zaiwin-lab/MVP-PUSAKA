'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, Bell, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stat } from '@/components/ui/stat';
import { useStore } from '@/lib/store';
import { actionAlerts, notifications, portfolioKpis } from '@/lib/metrics';
import { formatCurrency } from '@/lib/utils';
import { relativeDays } from '@/lib/dates';

export default function ActionCentrePage() {
  const { data } = useStore();
  const alerts = actionAlerts(data);
  const kpi = portfolioKpis(data);
  const notifs = notifications(data);

  const critical = alerts.filter((a) => a.severity === 'critical');
  const warning = alerts.filter((a) => a.severity === 'warning');
  const info = alerts.filter((a) => a.severity === 'info');

  const groups = [
    { title: 'Management action required', items: critical, tone: 'red' as const },
    { title: 'Needs attention', items: warning, tone: 'gold' as const },
    { title: 'For information', items: info, tone: 'emerald' as const },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Management Action Centre"
        title="Instead of reading reports, act on what matters."
        subtitle="Priority actions are surfaced automatically from the portfolio, pipeline and rental position. Every alert links straight to the records behind it."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Critical alerts" value={critical.length} sub="Require a decision this week" tone={critical.length ? 'red' : 'default'} icon={<ShieldAlert size={16} />} />
        <Stat label="Warnings" value={warning.length} sub="Act before they escalate" tone={warning.length ? 'gold' : 'default'} icon={<AlertTriangle size={16} />} />
        <Stat label="Unrealised monthly income" value={formatCurrency(kpi.potentialMonthly, { compact: true })} sub={`${formatCurrency(kpi.potentialAnnual, { compact: true })} annualised`} href="/portal/idle-assets" tone="dark" />
        <Stat label="Outstanding rental" value={formatCurrency(kpi.outstanding, { compact: true })} sub="Across all recorded periods" href="/portal/rental?filter=outstanding" tone={kpi.outstanding ? 'red' : 'default'} />
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-5">
          {groups.map((group) =>
            group.items.length ? (
              <Card key={group.title}>
                <CardHeader title={group.title} subtitle={`${group.items.length} item${group.items.length === 1 ? '' : 's'}`} />
                <CardBody className="space-y-3">
                  {group.items.map((alert) => (
                    <Link
                      key={alert.id}
                      href={alert.href}
                      className="group flex items-start gap-4 rounded-xl border border-line p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40"
                    >
                      {alert.metric ? (
                        <span
                          className={`flex h-12 min-w-12 shrink-0 items-center justify-center rounded-xl px-2 font-display text-[15px] font-semibold ${
                            group.tone === 'red' ? 'bg-red-50 text-red-700' : group.tone === 'gold' ? 'bg-gold-50 text-gold-600' : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {alert.metric}
                        </span>
                      ) : null}
                      <span className="flex-1">
                        <span className="block text-[14px] font-semibold leading-snug text-ink">{alert.title}</span>
                        <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-muted">{alert.detail}</span>
                        <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-emerald-700">
                          {alert.cta} <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </span>
                    </Link>
                  ))}
                </CardBody>
              </Card>
            ) : null,
          )}
        </div>

        <Card>
          <CardHeader title="Notifications" subtitle="New leads, follow-ups, viewings, tenancy and rental alerts" icon={<Bell size={16} />} />
          <CardBody className="space-y-3">
            {notifs.slice(0, 14).map((n) => (
              <Link key={n.id} href={n.href} className="flex gap-3 rounded-xl px-2 py-2 transition hover:bg-emerald-50/50">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    n.severity === 'critical' ? 'bg-red-500' : n.severity === 'warning' ? 'bg-gold-400' : 'bg-emerald-500'
                  }`}
                />
                <span className="flex-1">
                  <span className="block text-[13px] font-medium leading-snug text-ink">{n.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-ink-muted">{n.body}</span>
                  <span className="mt-0.5 block text-[11px] text-ink-soft">{relativeDays(n.created_at.slice(0, 10))}</span>
                </span>
              </Link>
            ))}
            <div className="hairline pt-4">
              <p className="text-[12px] leading-relaxed text-ink-soft">
                Notifications are in-app for now. The notification model is channel-agnostic, so email,
                WhatsApp, Telegram or SMS delivery can be added without redesigning the system.
              </p>
              <Badge tone="gold" className="mt-3">Future channels: Email · WhatsApp · Telegram · SMS</Badge>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
