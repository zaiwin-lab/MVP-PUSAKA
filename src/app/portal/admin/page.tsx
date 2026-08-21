'use client';

import { useState } from 'react';
import { Database, KeyRound, Settings2, Shield, SlidersHorizontal, Users } from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/field';
import { TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { leadSourceLabel, propertyStatusLabel, roleLabel } from '@/lib/labels';
import { PROPERTY_TYPES } from '@/lib/public';
import { formatDate } from '@/lib/dates';

const permissions: { role: string; scope: string }[] = [
  { role: 'Super Admin', scope: 'Full access to every module, user management and system settings.' },
  { role: 'Management', scope: 'Read access to all dashboards, reports and the action centre.' },
  { role: 'Property Manager', scope: 'Manage properties, tenancies and the full lead pipeline.' },
  { role: 'Officer', scope: 'Assigned portfolio and assigned leads only.' },
  { role: 'Finance Viewer', scope: 'Rental, collection and income information.' },
  { role: 'Referrer', scope: 'Own referral dashboard only — no access to the portfolio.' },
  { role: 'Public', scope: 'Public marketplace pages only.' },
];

export default function AdminPage() {
  const { data, resetDemo } = useStore();
  const [tab, setTab] = useState<'users' | 'settings' | 'taxonomy' | 'data'>('users');

  const tabs = [
    { key: 'users', label: 'Users & roles', icon: Users },
    { key: 'settings', label: 'Referral & system settings', icon: Settings2 },
    { key: 'taxonomy', label: 'Categories & statuses', icon: SlidersHorizontal },
    { key: 'data', label: 'Data & integrations', icon: Database },
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Admin & Settings"
        subtitle="Users, roles, referral policy, taxonomies and the integration path to Supabase."
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition ${
              tab === key ? 'bg-emerald-600 text-white' : 'bg-white text-ink-muted ring-1 ring-inset ring-line hover:bg-slate-50'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'users' ? (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <Card>
            <CardHeader title="Users" subtitle={`${data.users.length} accounts`} />
            <TableWrap className="min-w-full">
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Role</Th>
                  <Th>Contact</Th>
                  <Th>Created</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <Tr key={u.id}>
                    <Td>
                      <span className="font-medium text-ink">{u.name}</span>
                      <span className="mt-0.5 block text-[11.5px] text-ink-soft">{u.title}</span>
                    </Td>
                    <Td><Badge tone="emerald">{roleLabel[u.role]}</Badge></Td>
                    <Td className="text-[12.5px]">{u.email}<span className="mt-0.5 block text-ink-soft">{u.phone}</span></Td>
                    <Td className="text-[12.5px]">{formatDate(u.created_at)}</Td>
                    <Td><Badge tone={u.active ? 'emerald' : 'slate'}>{u.active ? 'Active' : 'Disabled'}</Badge></Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          </Card>

          <Card>
            <CardHeader title="Roles & permissions" icon={<Shield size={16} />} />
            <CardBody className="space-y-3">
              {permissions.map((p) => (
                <div key={p.role} className="rounded-xl border border-line p-3.5">
                  <p className="text-[13px] font-semibold text-ink">{p.role}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{p.scope}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === 'settings' ? (
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <Card>
            <CardHeader title="Referral settings" subtitle="No commission rate is hard-coded — KO-PUSAKA sets policy here" icon={<KeyRound size={16} />} />
            <CardBody className="space-y-4">
              <div>
                <Label htmlFor="model">Incentive model</Label>
                <Select id="model" defaultValue={data.settings.incentive_model}>
                  <option value="not_configured">Not configured — recognition only</option>
                  <option value="fixed">Fixed amount per successful deal</option>
                  <option value="percentage">Percentage of first-year rental or sale value</option>
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="value">Incentive value</Label>
                  <Input id="value" placeholder="Set once policy is approved" defaultValue={data.settings.incentive_value ?? ''} />
                </div>
                <div>
                  <Label htmlFor="window">Attribution window (days)</Label>
                  <Input id="window" type="number" defaultValue={data.settings.attribution_window_days} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <div>
                  <p className="text-[13.5px] font-medium text-ink">Public leaderboard</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">Show top referrers publicly (names only, with consent).</p>
                </div>
                <Badge tone={data.settings.leaderboard_public ? 'emerald' : 'slate'}>
                  {data.settings.leaderboard_public ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="rounded-xl bg-slate-50 p-3.5 text-[12px] leading-relaxed text-ink-muted">
                {data.settings.referral_policy_note}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="System settings" />
            <CardBody className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="org">Organisation</Label>
                  <Input id="org" defaultValue={data.settings.organisation} />
                </div>
                <div>
                  <Label htmlFor="wa">WhatsApp number</Label>
                  <Input id="wa" defaultValue={data.settings.whatsapp_number} />
                </div>
                <div>
                  <Label htmlFor="amber">Vacancy amber threshold (days)</Label>
                  <Input id="amber" type="number" defaultValue={data.settings.vacancy_amber_days} />
                </div>
                <div>
                  <Label htmlFor="red">Vacancy red threshold (days)</Label>
                  <Input id="red" type="number" defaultValue={data.settings.vacancy_red_days} />
                </div>
                <div>
                  <Label htmlFor="stale">Follow-up stale threshold (days)</Label>
                  <Input id="stale" type="number" defaultValue={data.settings.followup_stale_days} />
                </div>
                <div>
                  <Label htmlFor="email">Contact email</Label>
                  <Input id="email" defaultValue={data.settings.contact_email} />
                </div>
              </div>
              <p className="text-[12px] text-ink-soft">
                In the demo build these thresholds are read from seeded settings. Wiring them to the
                `system_settings` table makes them editable without a deployment.
              </p>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === 'taxonomy' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader title="Property categories" />
            <CardBody className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((t) => <Badge key={t} tone="slate">{t}</Badge>)}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Property statuses" />
            <CardBody className="flex flex-wrap gap-2">
              {Object.values(propertyStatusLabel).map((s) => <Badge key={s} tone="emerald">{s}</Badge>)}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Lead sources" />
            <CardBody className="flex flex-wrap gap-2">
              {Object.values(leadSourceLabel).map((s) => <Badge key={s} tone="gold">{s}</Badge>)}
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === 'data' ? (
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <Card>
            <CardHeader title="Data source" subtitle="How this prototype stores and will store data" icon={<Database size={16} />} />
            <CardBody className="space-y-3 text-[13px] leading-relaxed text-ink-muted">
              <p>
                The application currently runs on a seeded demo dataset held in the browser, so every
                interaction — new enquiries, stage changes, status updates — persists for the session.
              </p>
              <p>
                The schema in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px]">supabase/schema.sql</code> mirrors
                the domain model one-for-one: properties, leads, lead_activities, tenancies,
                rental_payments, referrers, referral_attributions, referral_rewards and the rest, with
                UUID keys, timestamps and row-level security policies.
              </p>
              <p>
                Attaching Supabase is a data-source swap — no component reads storage directly.
              </p>
              <Button variant="outline" size="sm" onClick={resetDemo}>Reset demo data</Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notification channels" subtitle="In-app today, channel-agnostic by design" />
            <CardBody className="space-y-3">
              {[
                { channel: 'In-app', status: 'Live' },
                { channel: 'Email', status: 'Ready to connect' },
                { channel: 'WhatsApp Business API', status: 'Ready to connect' },
                { channel: 'Telegram', status: 'Ready to connect' },
                { channel: 'SMS', status: 'Ready to connect' },
              ].map((row) => (
                <div key={row.channel} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                  <span className="text-[13.5px] text-ink">{row.channel}</span>
                  <Badge tone={row.status === 'Live' ? 'emerald' : 'slate'}>{row.status}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      ) : null}
    </>
  );
}
