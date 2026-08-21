'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Link2, Megaphone, QrCode } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/field';
import { Stat } from '@/components/ui/stat';
import { TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { ChannelBars } from '@/components/charts';
import { useStore } from '@/lib/store';
import { SITE_URL } from '@/lib/data/settings';
import { sourcePerformance } from '@/lib/metrics';
import { leadSourceLabel } from '@/lib/labels';
import { formatNumber, formatPercent } from '@/lib/utils';
import { formatDate } from '@/lib/dates';
import type { LeadSourceKey } from '@/lib/types';

export default function CampaignsPage() {
  const { data } = useStore();
  const [channel, setChannel] = useState<LeadSourceKey>('facebook');
  const [campaignName, setCampaignName] = useState('vacant-commercial-push');
  const [property, setProperty] = useState('');
  const [copied, setCopied] = useState(false);

  const performance = sourcePerformance(data);

  const rows = useMemo(
    () =>
      data.campaigns.map((c) => {
        const leads = data.leads.filter((l) => l.campaign_id === c.id);
        const qualified = leads.filter((l) => !['new', 'contacted', 'lost'].includes(l.stage));
        const deals = leads.filter((l) => l.stage === 'successful');
        return {
          campaign: c,
          visitors: c.visitors,
          leads: leads.length,
          qualified: qualified.length,
          deals: deals.length,
          conversion: c.visitors ? (leads.length / c.visitors) * 100 : 0,
        };
      }),
    [data.campaigns, data.leads],
  );

  // Resolved after mount so the server and first client render agree.
  const [base, setBase] = useState(SITE_URL);
  useEffect(() => setBase(window.location.origin), []);
  const target = property ? `/property/${data.properties.find((p) => p.id === property)?.slug ?? ''}` : '/properties';
  const generated = `${base}${target}?src=${channel}&utm_source=${channel}&utm_campaign=${campaignName || 'campaign'}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const totals = rows.reduce(
    (acc, r) => ({
      visitors: acc.visitors + r.visitors,
      leads: acc.leads + r.leads,
      qualified: acc.qualified + r.qualified,
      deals: acc.deals + r.deals,
    }),
    { visitors: 0, leads: 0, qualified: 0, deals: 0 },
  );

  return (
    <>
      <PageHeader
        eyebrow="Campaign Tracking"
        title="Know which channel actually produces business."
        subtitle="Build a tracked link for any channel, then compare visitors, enquiries, qualified leads and closed deals side by side."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tracked visitors" value={formatNumber(totals.visitors)} sub="Across all campaign links" icon={<Megaphone size={16} />} />
        <Stat label="Enquiries" value={totals.leads} sub={`${formatPercent((totals.leads / Math.max(1, totals.visitors)) * 100, 2)} visitor-to-enquiry`} tone="emerald" />
        <Stat label="Qualified leads" value={totals.qualified} sub="Past first contact" />
        <Stat label="Deals closed" value={totals.deals} sub="Attributed to a campaign" tone="emerald" />
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <Card>
          <CardHeader title="Build a campaign link" subtitle="Every enquiry from this link is attributed to the channel" icon={<Link2 size={16} />} />
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="channel">Channel</Label>
              <Select id="channel" value={channel} onChange={(e) => setChannel(e.target.value as LeadSourceKey)}>
                {Object.entries(leadSourceLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="cname">Campaign name</Label>
              <Input id="cname" value={campaignName} onChange={(e) => setCampaignName(e.target.value.replace(/\s+/g, '-').toLowerCase())} />
            </div>
            <div>
              <Label htmlFor="cprop">Landing page</Label>
              <Select id="cprop" value={property} onChange={(e) => setProperty(e.target.value)}>
                <option value="">All properties page</option>
                {data.properties.filter((p) => p.published).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <p className="break-all text-[12px] leading-relaxed text-ink-muted">{generated}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={copy}>
                <Copy size={14} /> {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(generated, '_blank')}>
                <QrCode size={14} /> Open link
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Leads and deals by channel" subtitle="Where business is actually coming from" />
          <CardBody>
            <ChannelBars
              data={performance.map((s) => ({
                source: leadSourceLabel[s.source as keyof typeof leadSourceLabel] ?? s.source,
                leads: s.leads,
                deals: s.deals,
              }))}
            />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Campaign performance" subtitle="Visitors through to closed deals" />
        <TableWrap className="min-w-full">
          <thead>
            <tr>
              <Th>Campaign</Th>
              <Th>Channel</Th>
              <Th>Started</Th>
              <Th align="right">Visitors</Th>
              <Th align="right">Enquiries</Th>
              <Th align="right">Qualified</Th>
              <Th align="right">Deals</Th>
              <Th align="right">Conversion</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Tr key={row.campaign.id}>
                <Td className="font-medium text-ink">{row.campaign.name}</Td>
                <Td className="text-[12.5px]">{leadSourceLabel[row.campaign.channel]}</Td>
                <Td className="text-[12.5px]">{formatDate(row.campaign.start_date)}</Td>
                <Td align="right">{formatNumber(row.visitors)}</Td>
                <Td align="right">{row.leads}</Td>
                <Td align="right">{row.qualified}</Td>
                <Td align="right">{row.deals}</Td>
                <Td align="right">{formatPercent(row.conversion, 2)}</Td>
                <Td><Badge tone={row.campaign.active ? 'emerald' : 'slate'}>{row.campaign.active ? 'Active' : 'Ended'}</Badge></Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>
    </>
  );
}
