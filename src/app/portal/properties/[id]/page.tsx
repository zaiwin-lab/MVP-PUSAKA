'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  Activity, ArrowLeft, Building2, CalendarClock, ExternalLink, FileText, Handshake, Megaphone,
  Save, Users, Wallet,
} from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { PropertyImage } from '@/components/property-image';
import { ShareTools } from '@/components/public/share-tools';
import { StageBadge } from '@/components/portal/lead-bits';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, HealthDot } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/field';
import { MiniStat, Progress } from '@/components/ui/stat';
import { EmptyState, TableWrap, Td, Th, Tr } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { scorecard } from '@/lib/metrics';
import { badgeLabel, healthLabel, propertyStatusLabel, propertyStatusTone } from '@/lib/labels';
import type { MarketingBadge, PropertyStatus } from '@/lib/types';
import { formatCurrency, formatSqft } from '@/lib/utils';
import { daysUntil, formatDate, periodLabel } from '@/lib/dates';

const marketingBadges: MarketingBadge[] = ['featured', 'urgent_rent', 'urgent_sale', 'new_listing', 'price_updated'];

export default function PortalPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { data, setPropertyStatus, updateProperty, recordMarketingActivity } = useStore();
  const property = data.properties.find((p) => p.id === id);
  const [nextAction, setNextAction] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (!property) {
    return <EmptyState title="Property not found" detail="It may have been reset with the demo data." action={<ButtonLink href="/portal/properties" size="sm" className="mt-3">Back to portfolio</ButtonLink>} />;
  }

  const card = scorecard(data, property);
  const officer = data.users.find((u) => u.id === property.officer_id);
  const propertyLeads = data.leads.filter((l) => l.property_id === property.id);
  const payments = data.payments.filter((p) => p.property_id === property.id).sort((a, b) => (a.period < b.period ? 1 : -1));
  const tenancy = card.tenancy;

  return (
    <>
      <Link href="/portal/properties" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition hover:text-emerald-700">
        <ArrowLeft size={14} /> Back to portfolio
      </Link>

      <PageHeader
        eyebrow={`${property.code} · ${property.type}`}
        title={property.name}
        subtitle={`${property.address}, ${property.location} · Last updated ${formatDate(property.updated_at)}`}
        action={
          <>
            {property.published ? (
              <ButtonLink href={`/property/${property.slug}`} variant="outline" size="sm">
                <ExternalLink size={14} /> Public listing
              </ButtonLink>
            ) : null}
            <Button
              size="sm"
              onClick={() => { recordMarketingActivity(property.id, 'Listing refreshed and shared'); setSavedAt(new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })); }}
            >
              <Megaphone size={14} /> Record marketing activity
            </Button>
          </>
        }
      />

      {/* --------------------------------------------------------- Scorecard */}
      <Card className={`mb-5 ${card.health === 'red' ? 'border-red-200 bg-red-50/40' : card.health === 'amber' ? 'border-gold-200 bg-gold-50/40' : 'border-emerald-200 bg-emerald-50/40'}`}>
        <CardBody className="flex flex-wrap items-start justify-between gap-5 p-5">
          <div className="flex items-start gap-3">
            <HealthDot health={card.health} className="mt-1.5 h-3.5 w-3.5" />
            <div>
              <p className="font-display text-[19px] font-semibold text-ink">{healthLabel[card.health]}</p>
              <ul className="mt-1.5 space-y-0.5">
                {card.healthReasons.map((reason) => (
                  <li key={reason} className="text-[13px] text-ink-muted">· {reason}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat label="Monthly income" value={formatCurrency(card.monthlyIncome, { compact: true })} tone={card.monthlyIncome ? 'emerald' : undefined} />
            <MiniStat label="Unrealised" value={formatCurrency(card.potentialMonthlyIncome, { compact: true })} tone={card.potentialMonthlyIncome ? 'gold' : undefined} />
            <MiniStat label="Vacant days" value={card.vacantDays || '—'} tone={card.vacantDays > 90 ? 'red' : undefined} />
            <MiniStat label="Outstanding" value={formatCurrency(card.outstanding, { compact: true })} tone={card.outstanding ? 'red' : undefined} />
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Performance scorecard" subtitle="How this asset is performing this month" icon={<Activity size={16} />} />
            <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Enquiries this month', value: card.leadsThisMonth },
                { label: 'Total enquiries', value: card.leads },
                { label: 'Viewings', value: card.viewings },
                { label: 'Offers', value: card.offers },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">{stat.label}</p>
                  <p className="mt-1.5 font-display text-[24px] font-semibold leading-none text-ink">{stat.value}</p>
                </div>
              ))}
              <div className="col-span-2 sm:col-span-4">
                <div className="flex items-center justify-between text-[12px] text-ink-muted">
                  <span>Marketing activity</span>
                  <span>{card.daysSinceMarketing === null ? 'Never marketed' : `${card.daysSinceMarketing} days since last activity`}</span>
                </div>
                <Progress
                  className="mt-2"
                  value={card.daysSinceMarketing === null ? 0 : Math.max(0, 100 - card.daysSinceMarketing * 2)}
                  tone={card.daysSinceMarketing !== null && card.daysSinceMarketing > 30 ? 'red' : 'emerald'}
                />
                {savedAt ? <p className="mt-2 text-[11.5px] text-emerald-700">Marketing activity recorded at {savedAt}.</p> : null}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Status & next action" subtitle="Update the position without leaving this screen" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="status">Property status</Label>
                <Select id="status" value={property.status} onChange={(e) => setPropertyStatus(property.id, e.target.value as PropertyStatus)}>
                  {Object.entries(propertyStatusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="officer">Officer responsible</Label>
                <Select id="officer" value={property.officer_id} onChange={(e) => updateProperty(property.id, { officer_id: e.target.value })}>
                  {data.users.filter((u) => ['officer', 'property_manager', 'super_admin'].includes(u.role)).map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="next">Next action</Label>
                <div className="flex gap-2">
                  <Input id="next" value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder={property.next_action} />
                  <Button
                    size="md"
                    disabled={!nextAction.trim()}
                    onClick={() => { updateProperty(property.id, { next_action: nextAction.trim() }); setNextAction(''); }}
                  >
                    <Save size={15} /> Save
                  </Button>
                </div>
                <p className="mt-2 text-[12px] text-ink-soft">
                  Currently: <strong className="font-medium text-ink">{property.next_action}</strong> · due {formatDate(property.next_action_due)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label>Marketing badges</Label>
                <div className="flex flex-wrap gap-2">
                  {marketingBadges.map((b) => {
                    const on = property.badges.includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() =>
                          updateProperty(property.id, {
                            badges: on ? property.badges.filter((x) => x !== b) : [...property.badges, b],
                          })
                        }
                        className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                          on ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
                        }`}
                      >
                        {badgeLabel[b]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <div>
                  <p className="text-[13.5px] font-medium text-ink">Published on the public marketplace</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">Only published listings are visible to the public.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={property.published}
                  onClick={() => updateProperty(property.id, { published: !property.published })}
                  className={`relative h-6 w-11 rounded-full transition ${property.published ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${property.published ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={`Leads on this property (${propertyLeads.length})`} icon={<Users size={16} />} />
            {propertyLeads.length ? (
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Prospect</Th>
                    <Th>Stage</Th>
                    <Th>Source</Th>
                    <Th align="right">Value</Th>
                    <Th>Next action</Th>
                  </tr>
                </thead>
                <tbody>
                  {propertyLeads.map((lead) => (
                    <Tr key={lead.id}>
                      <Td>
                        <Link href={`/portal/leads/${lead.id}`} className="font-medium text-ink hover:text-emerald-700">{lead.name}</Link>
                        <span className="mt-0.5 block text-[11.5px] text-ink-soft">{lead.code}</span>
                      </Td>
                      <Td><StageBadge stage={lead.stage} /></Td>
                      <Td className="text-[12.5px]">{lead.referral_code ?? lead.source}</Td>
                      <Td align="right">{formatCurrency(lead.estimated_value, { compact: true })}</Td>
                      <Td className="max-w-[200px] truncate text-[12.5px] text-ink-muted">{lead.next_action}</Td>
                    </Tr>
                  ))}
                </tbody>
              </TableWrap>
            ) : (
              <CardBody>
                <EmptyState title="No enquiries yet" detail="This asset is generating no interest. Refresh the listing, share it through the referral network, or review the asking rate." />
              </CardBody>
            )}
          </Card>

          <Card>
            <CardHeader title="Rental ledger" subtitle="Recent collection position" icon={<Wallet size={16} />} />
            {payments.length ? (
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Period</Th>
                    <Th align="right">Due</Th>
                    <Th align="right">Paid</Th>
                    <Th align="right">Outstanding</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <Tr key={p.id}>
                      <Td>{periodLabel(p.period)}</Td>
                      <Td align="right">{formatCurrency(p.amount_due)}</Td>
                      <Td align="right">{formatCurrency(p.amount_paid)}</Td>
                      <Td align="right" className={p.amount_due - p.amount_paid > 0 ? 'font-semibold text-red-600' : ''}>
                        {formatCurrency(p.amount_due - p.amount_paid)}
                      </Td>
                      <Td>
                        <Badge tone={p.status === 'paid' ? 'emerald' : p.status === 'partial' ? 'gold' : 'red'}>{p.status}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TableWrap>
            ) : (
              <CardBody>
                <EmptyState title="No rental records" detail="This property is not currently generating rental income." />
              </CardBody>
            )}
          </Card>
        </div>

        {/* ----------------------------------------------------------- Sidebar */}
        <div className="min-w-0 space-y-5">
          <Card className="overflow-hidden">
            <div className="aspect-[16/10]">
              <PropertyImage seed={property.code} type={property.type} view={property.images[0]} />
            </div>
            <CardBody className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge tone={propertyStatusTone[property.status]}>{propertyStatusLabel[property.status]}</Badge>
                {property.badges.map((b) => <Badge key={b} tone="gold">{badgeLabel[b]}</Badge>)}
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                {[
                  { label: 'Asset value', value: formatCurrency(property.asset_value) },
                  { label: property.listing_intent === 'sale' ? 'Asking price' : 'Asking rent', value: formatCurrency(property.listing_intent === 'sale' ? property.sale_price : property.asking_rent) },
                  { label: 'Current rent', value: formatCurrency(property.current_rent) },
                  { label: 'Deposit', value: formatCurrency(property.deposit) },
                  { label: 'Floor size', value: formatSqft(property.floor_size_sqft) },
                  { label: 'Land size', value: formatSqft(property.land_size_sqft) },
                  { label: 'Annual rental value', value: formatCurrency((property.current_rent ?? 0) * 12, { compact: true }) },
                  { label: 'Potential annual', value: formatCurrency((property.asking_rent ?? 0) * 12, { compact: true }) },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="text-[11px] uppercase tracking-[0.06em] text-ink-soft">{row.label}</p>
                    <p className="mt-0.5 font-medium text-ink">{row.value}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {tenancy ? (
            <Card>
              <CardHeader
                title="Tenancy"
                subtitle={`${tenancy.code} · ${tenancy.renewal_status.replace(/_/g, ' ')}`}
                icon={<CalendarClock size={16} />}
              />
              <CardBody className="space-y-2.5 text-[13px]">
                <p className="font-semibold text-ink">{tenancy.tenant_company ?? tenancy.tenant_name}</p>
                <p className="text-[12.5px] text-ink-muted">{tenancy.tenant_name} · {tenancy.tenant_phone}</p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.06em] text-ink-soft">Commences</p>
                    <p className="mt-0.5 font-medium text-ink">{formatDate(tenancy.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.06em] text-ink-soft">Expires</p>
                    <p className="mt-0.5 font-medium text-ink">{formatDate(tenancy.end_date)}</p>
                  </div>
                </div>
                {daysUntil(tenancy.end_date) <= 90 && daysUntil(tenancy.end_date) >= 0 ? (
                  <Badge tone={daysUntil(tenancy.end_date) <= 30 ? 'red' : 'gold'}>
                    Expires in {daysUntil(tenancy.end_date)} days
                  </Badge>
                ) : null}
                <ButtonLink href="/portal/tenancies" variant="outline" size="sm" className="mt-2 w-full">
                  Open tenancy register
                </ButtonLink>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Officer responsible" icon={<Building2 size={16} />} />
            <CardBody className="space-y-1.5 text-[13px]">
              <p className="font-semibold text-ink">{officer?.name}</p>
              <p className="text-[12.5px] text-ink-muted">{officer?.title}</p>
              <p className="text-[12.5px] text-ink-muted">{officer?.phone} · {officer?.email}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Share & market" icon={<Handshake size={16} />} />
            <CardBody>
              <ShareTools url={`/property/${property.slug}`} title={property.name} location={property.location} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Documents" icon={<FileText size={16} />} />
            <CardBody className="space-y-2">
              {property.documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-[12.5px]">
                  <span className="text-ink">{doc.name}</span>
                  <span className="text-ink-soft">{doc.kind} · {doc.size}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
