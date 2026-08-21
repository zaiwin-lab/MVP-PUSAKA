'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Award, CheckCircle2, Download, Handshake, PauseCircle, Trophy, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stat, Progress } from '@/components/ui/stat';
import { TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { leaderboard, referralSummary } from '@/lib/metrics';
import { incentiveStatusLabel, referrerStatusLabel } from '@/lib/labels';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { formatDate } from '@/lib/dates';
import { downloadCsv } from '@/lib/csv';
import type { IncentiveStatus } from '@/lib/types';

const statusTone = { approved: 'emerald', pending: 'gold', suspended: 'red', deactivated: 'slate' } as const;

function ReferrersInner() {
  const params = useSearchParams();
  const { data, setReferrerStatus, setRewardStatus } = useStore();
  const [filter, setFilter] = useState(params.get('filter') ?? '');

  const summary = referralSummary(data);
  const board = leaderboard(data);
  const rows = data.referrers.filter((r) => (filter ? r.status === filter : true));

  const exportCsv = () =>
    downloadCsv(
      'kopusaka-referral-performance',
      board.map((r) => ({
        Code: r.referrer.code,
        Referrer: r.referrer.name,
        Organisation: r.referrer.organisation ?? '',
        Type: r.referrer.referrer_type,
        Status: referrerStatusLabel[r.referrer.status],
        Clicks: r.clicks,
        'Unique visitors': r.uniqueVisitors,
        Enquiries: r.enquiries,
        Qualified: r.qualified,
        Viewings: r.viewings,
        Deals: r.deals,
        'Conversion rate (%)': r.conversionRate.toFixed(1),
      })),
    );

  return (
    <>
      <PageHeader
        eyebrow="KO-PUSAKA Property Referral Network"
        title="Refer. Connect. Earn Recognition."
        subtitle="Approve referrers, track attribution from click to closed deal, and record incentive eligibility — without hard-coding any commission rate."
        action={<Button variant="outline" size="sm" onClick={exportCsv}><Download size={14} /> Export CSV</Button>}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Active referrers" value={summary.activeReferrers} sub={`${summary.pendingReferrers} awaiting approval`} icon={<Handshake size={16} />} />
        <Stat label="Link clicks" value={formatNumber(summary.clicks)} sub="Across all referral links" />
        <Stat label="Enquiries generated" value={summary.enquiries} sub={`${formatPercent((summary.enquiries / Math.max(1, summary.clicks)) * 100, 1)} click-to-enquiry`} tone="emerald" />
        <Stat label="Qualified leads" value={summary.qualified} sub="Past first contact" />
        <Stat label="Successful deals" value={summary.deals} sub="Recorded conversions" tone="emerald" />
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <Card>
          <CardHeader
            title="Referrer register"
            subtitle="Approve, suspend or deactivate — status changes take effect immediately"
            action={
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: '', label: 'All' },
                  { key: 'pending', label: `Pending (${data.referrers.filter((r) => r.status === 'pending').length})` },
                  { key: 'approved', label: 'Approved' },
                  { key: 'suspended', label: 'Suspended' },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition ${
                      filter === f.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            }
          />
          <TableWrap className="min-w-full">
            <thead>
              <tr>
                <Th>Referrer</Th>
                <Th>Code</Th>
                <Th>Type</Th>
                <Th align="right">Clicks</Th>
                <Th align="right">Enquiries</Th>
                <Th align="right">Deals</Th>
                <Th>Status</Th>
                <Th>Governance</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((referrer) => {
                const stats = board.find((b) => b.referrer.id === referrer.id);
                const enquiries = data.leads.filter((l) => l.referrer_id === referrer.id).length;
                return (
                  <Tr key={referrer.id}>
                    <Td>
                      <Link href={`/portal/referrers/${referrer.id}`} className="font-medium text-ink hover:text-emerald-700">
                        {referrer.name}
                      </Link>
                      <span className="mt-0.5 block text-[11.5px] text-ink-soft">{referrer.organisation ?? referrer.occupation}</span>
                    </Td>
                    <Td><Badge tone="slate">{referrer.code}</Badge></Td>
                    <Td className="text-[12.5px] capitalize">{referrer.referrer_type}</Td>
                    <Td align="right">{formatNumber(referrer.clicks)}</Td>
                    <Td align="right">{enquiries}</Td>
                    <Td align="right">{stats?.deals ?? 0}</Td>
                    <Td><Badge tone={statusTone[referrer.status]}>{referrerStatusLabel[referrer.status]}</Badge></Td>
                    <Td>
                      <div className="flex flex-wrap gap-1.5">
                        {referrer.status !== 'approved' ? (
                          <Button variant="outline" size="sm" onClick={() => setReferrerStatus(referrer.id, 'approved')}>
                            <CheckCircle2 size={13} /> Approve
                          </Button>
                        ) : null}
                        {referrer.status === 'approved' ? (
                          <Button variant="outline" size="sm" onClick={() => setReferrerStatus(referrer.id, 'suspended')}>
                            <PauseCircle size={13} /> Suspend
                          </Button>
                        ) : null}
                        {referrer.status !== 'deactivated' ? (
                          <Button variant="ghost" size="sm" onClick={() => setReferrerStatus(referrer.id, 'deactivated')}>
                            <XCircle size={13} /> Deactivate
                          </Button>
                        ) : null}
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </TableWrap>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Leaderboard" subtitle="Top referrers by conversion" icon={<Trophy size={16} />} />
            <CardBody className="space-y-4">
              {board.map((row, i) => (
                <div key={row.referrer.id} className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold ${
                    i === 0 ? 'bg-gold-100 text-gold-600' : 'bg-slate-100 text-ink-muted'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/portal/referrers/${row.referrer.id}`} className="block truncate text-[13px] font-medium text-ink hover:text-emerald-700">
                      {row.referrer.name}
                    </Link>
                    <Progress className="mt-1.5" value={(row.enquiries / Math.max(1, board[0]?.enquiries ?? 1)) * 100} />
                    <p className="mt-1 text-[11.5px] text-ink-soft">
                      {row.enquiries} enquiries · {row.qualified} qualified · {row.deals} deals
                    </p>
                  </div>
                </div>
              ))}
              <p className="hairline pt-4 text-[11.5px] leading-relaxed text-ink-soft">
                The public leaderboard is {data.settings.leaderboard_public ? 'enabled' : 'disabled'} in system
                settings. Personal data is never published — only names where the referrer has consented.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Incentive register" subtitle="Eligibility recorded, value determined by policy" icon={<Award size={16} />} />
            <CardBody className="space-y-3">
              {data.rewards.map((reward) => {
                const referrer = data.referrers.find((r) => r.id === reward.referrer_id);
                const property = data.properties.find((p) => p.id === reward.property_id);
                return (
                  <div key={reward.id} className="rounded-xl border border-line p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-ink">{referrer?.name}</p>
                        <p className="mt-0.5 text-[11.5px] text-ink-soft">{property?.name} · {formatDate(reward.recorded_at)}</p>
                      </div>
                      <Badge tone={reward.status === 'paid' ? 'emerald' : reward.status === 'approved' ? 'gold' : reward.status === 'rejected' ? 'red' : 'slate'}>
                        {incentiveStatusLabel[reward.status]}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[12.5px] text-ink-muted">
                      Deal value {formatCurrency(reward.deal_value)} · incentive{' '}
                      {reward.incentive_amount === null ? 'not yet determined' : formatCurrency(reward.incentive_amount)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(['pending', 'approved', 'paid', 'rejected'] as IncentiveStatus[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRewardStatus(reward.id, s)}
                          className={`rounded-lg px-2.5 py-1 text-[11.5px] font-semibold transition ${
                            reward.status === s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
                          }`}
                        >
                          {incentiveStatusLabel[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <p className="rounded-xl bg-slate-50 p-3.5 text-[12px] leading-relaxed text-ink-muted">
                {data.settings.referral_policy_note}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function ReferrersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading referral network…</p>}>
      <ReferrersInner />
    </Suspense>
  );
}
