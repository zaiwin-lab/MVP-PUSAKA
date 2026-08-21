'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft, Building2, CalendarPlus, CheckCircle2, ClipboardList, Clock, Handshake, Mail,
  MessageSquarePlus, Phone, StickyNote, User, XCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/portal/page-header';
import { FollowupChip, QuickContact, StageBadge } from '@/components/portal/lead-bits';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button, ButtonLink } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { leadSourceLabel, leadStageLabel, leadStages } from '@/lib/labels';
import { formatCurrency } from '@/lib/utils';
import { d, formatDate, formatDateTime, relativeDays } from '@/lib/dates';
import type { ActivityKind, LeadStage } from '@/lib/types';

const activityIcon: Record<string, typeof Phone> = {
  call: Phone,
  whatsapp: MessageSquarePlus,
  email: Mail,
  note: StickyNote,
  viewing: Building2,
  stage_change: ClipboardList,
  created: User,
  assignment: User,
  offer: Handshake,
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, updateLeadStage, assignLead, logActivity, scheduleFollowup, markLeadLost } = useStore();

  const lead = data.leads.find((l) => l.id === id);
  const [noteOpen, setNoteOpen] = useState(false);
  const [followupOpen, setFollowupOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [note, setNote] = useState('');
  const [followupDate, setFollowupDate] = useState(d(2));
  const [followupAction, setFollowupAction] = useState('');
  const [lostReason, setLostReason] = useState('');

  if (!lead) {
    return <EmptyState title="Lead not found" detail="It may have been reset with the demo data." action={<ButtonLink href="/portal/leads" size="sm" className="mt-3">Back to CRM</ButtonLink>} />;
  }

  const property = data.properties.find((p) => p.id === lead.property_id) ?? null;
  const referrer = data.referrers.find((r) => r.id === lead.referrer_id) ?? null;
  const officer = data.users.find((u) => u.id === lead.officer_id) ?? null;
  const activities = data.activities
    .filter((a) => a.lead_id === lead.id)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const viewings = data.viewings.filter((v) => v.lead_id === lead.id);
  const offers = data.offers.filter((o) => o.lead_id === lead.id);

  const stageIndex = leadStages.indexOf(lead.stage);
  const progressStages = leadStages.filter((s) => s !== 'lost');

  return (
    <>
      <button
        type="button"
        onClick={() => router.push('/portal/leads')}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition hover:text-emerald-700"
      >
        <ArrowLeft size={14} /> Back to Lead CRM
      </button>

      <PageHeader
        eyebrow={`Lead ${lead.code}`}
        title={lead.name}
        subtitle={`${lead.company ? `${lead.company} · ` : ''}Received ${formatDate(lead.created_at)} · ${leadSourceLabel[lead.source]}${lead.referral_code ? ` (${lead.referral_code})` : ''}`}
        action={
          <>
            <QuickContact lead={lead} onLog={(kind) => logActivity(lead.id, kind as ActivityKind, `${kind === 'call' ? 'Call' : kind === 'whatsapp' ? 'WhatsApp message' : 'Email'} initiated from the CRM`)} />
            <Button variant="outline" size="sm" onClick={() => setNoteOpen(true)}>
              <StickyNote size={14} /> Add note
            </Button>
            <Button size="sm" onClick={() => setFollowupOpen(true)}>
              <CalendarPlus size={14} /> Schedule follow-up
            </Button>
          </>
        }
      />

      {/* ------------------------------------------------------- Stage tracker */}
      <Card className="mb-5">
        <CardBody className="p-4 sm:p-5">
          <div className="scrollbar-slim flex gap-1.5 overflow-x-auto pb-1">
            {progressStages.map((stage, i) => {
              const done = stageIndex >= 0 && i <= stageIndex && lead.stage !== 'lost';
              const current = lead.stage === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => updateLeadStage(lead.id, stage as LeadStage, 'Updated from the lead record')}
                  className={`group relative flex-1 whitespace-nowrap rounded-lg px-3 py-2.5 text-[11.5px] font-semibold transition-all ${
                    current
                      ? 'bg-emerald-600 text-white'
                      : done
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-50 text-ink-muted hover:bg-slate-100'
                  }`}
                >
                  {leadStageLabel[stage]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setLostOpen(true)}
              className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-[11.5px] font-semibold transition ${
                lead.stage === 'lost' ? 'bg-red-600 text-white' : 'bg-slate-50 text-ink-muted hover:bg-red-50 hover:text-red-600'
              }`}
            >
              Lost
            </button>
          </div>
          <p className="mt-3 text-[12px] text-ink-soft">
            Click any stage to move this lead. Property status updates automatically when a lead reaches
            negotiation, agreement or successful.
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader
              title="Next action"
              subtitle={lead.next_action}
              action={<FollowupChip date={lead.next_followup} />}
            />
            <CardBody className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Next follow-up</p>
                <p className="mt-1.5 text-[14px] font-semibold text-ink">{formatDate(lead.next_followup)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Last interaction</p>
                <p className="mt-1.5 text-[14px] font-semibold text-ink">{relativeDays(lead.last_interaction)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Estimated value</p>
                <p className="mt-1.5 text-[14px] font-semibold text-ink">
                  {formatCurrency(lead.estimated_value)}
                  <span className="ml-1 text-[11.5px] font-normal text-ink-muted">
                    {lead.estimated_value > 100_000 ? 'sale' : '/ month'}
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity timeline" subtitle={`${activities.length} recorded interactions`} icon={<Clock size={16} />} />
            <CardBody>
              <ol className="relative space-y-5 border-l border-line pl-6">
                {activities.map((act) => {
                  const Icon = activityIcon[act.kind] ?? StickyNote;
                  return (
                    <li key={act.id} className="relative">
                      <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white text-emerald-700">
                        <Icon size={12} />
                      </span>
                      <p className="text-[13.5px] font-medium leading-snug text-ink">{act.summary}</p>
                      {act.detail ? <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{act.detail}</p> : null}
                      <p className="mt-1 text-[11.5px] text-ink-soft">
                        {act.actor} · {formatDateTime(act.created_at)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </CardBody>
          </Card>

          {viewings.length || offers.length ? (
            <Card>
              <CardHeader title="Viewings & offers" />
              <CardBody className="space-y-3">
                {viewings.map((v) => (
                  <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                    <div>
                      <p className="text-[13.5px] font-medium text-ink">Viewing — {formatDateTime(v.scheduled_at)}</p>
                      <p className="mt-0.5 text-[12px] text-ink-muted">{v.outcome ?? 'Awaiting outcome'}</p>
                    </div>
                    <Badge tone={v.status === 'completed' ? 'emerald' : v.status === 'scheduled' ? 'gold' : 'slate'}>{v.status}</Badge>
                  </div>
                ))}
                {offers.map((o) => (
                  <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                    <div>
                      <p className="text-[13.5px] font-medium text-ink">
                        Offer — {formatCurrency(o.amount)} {o.kind === 'rent' ? '/ month' : 'purchase'}
                      </p>
                      <p className="mt-0.5 text-[12px] text-ink-muted">{o.notes} · {formatDate(o.submitted_at)}</p>
                    </div>
                    <Badge tone={o.status === 'accepted' ? 'emerald' : o.status === 'rejected' ? 'red' : 'gold'}>{o.status}</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          ) : null}
        </div>

        {/* ------------------------------------------------------------ Sidebar */}
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Prospect" icon={<User size={16} />} action={<StageBadge stage={lead.stage} />} />
            <CardBody className="space-y-3 text-[13.5px]">
              {[
                { label: 'Phone', value: lead.phone },
                { label: 'Email', value: lead.email },
                { label: 'Company', value: lead.company ?? '—' },
                { label: 'Preferred contact', value: lead.preferred_contact },
                { label: 'Interested in', value: lead.interest },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 border-b border-line/70 pb-2.5 last:border-0">
                  <span className="text-[12px] text-ink-muted">{row.label}</span>
                  <span className="text-right font-medium capitalize text-ink">{row.value}</span>
                </div>
              ))}
              <div className="rounded-xl bg-slate-50 p-3.5 text-[12.5px] leading-relaxed text-ink-muted">
                “{lead.message}”
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Assignment" />
            <CardBody className="space-y-3">
              <div>
                <Label htmlFor="officer">Assigned officer</Label>
                <Select id="officer" value={lead.officer_id ?? ''} onChange={(e) => assignLead(lead.id, e.target.value)}>
                  <option value="">Unassigned</option>
                  {data.users
                    .filter((u) => ['officer', 'property_manager', 'super_admin'].includes(u.role))
                    .map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </Select>
              </div>
              {officer ? (
                <p className="text-[12px] text-ink-muted">
                  {officer.title} · {officer.phone}
                </p>
              ) : null}
            </CardBody>
          </Card>

          {property ? (
            <Card>
              <CardHeader title="Property" icon={<Building2 size={16} />} />
              <CardBody className="space-y-2">
                <Link href={`/portal/properties/${property.id}`} className="text-[14px] font-semibold text-ink hover:text-emerald-700">
                  {property.name}
                </Link>
                <p className="text-[12.5px] text-ink-muted">{property.address}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge tone="slate">{property.code}</Badge>
                  <Badge tone="emerald">{formatCurrency(property.asking_rent ?? property.sale_price, { compact: true })}</Badge>
                </div>
                <ButtonLink href={`/property/${property.slug}`} variant="outline" size="sm" className="mt-2 w-full">
                  View public listing
                </ButtonLink>
              </CardBody>
            </Card>
          ) : null}

          {referrer ? (
            <Card className="bg-emerald-50/50">
              <CardHeader title="Referral attribution" icon={<Handshake size={16} />} />
              <CardBody className="space-y-2 text-[13px]">
                <p className="font-semibold text-ink">{referrer.name}</p>
                <p className="text-[12.5px] text-ink-muted">{referrer.organisation ?? referrer.occupation}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge tone="emerald">{referrer.code}</Badge>
                  <Badge tone="slate">Captured {formatDate(lead.created_at)}</Badge>
                </div>
                <ButtonLink href={`/portal/referrers/${referrer.id}`} variant="outline" size="sm" className="mt-2 w-full">
                  Open referrer record
                </ButtonLink>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>

      {/* -------------------------------------------------------------- Modals */}
      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add a note"
        subtitle="Recorded on the timeline and marks the lead as touched today."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!note.trim()}
              onClick={() => { logActivity(lead.id, 'note', 'Note added', note.trim()); setNote(''); setNoteOpen(false); }}
            >
              Save note
            </Button>
          </>
        }
      >
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was discussed, agreed or promised?" />
      </Modal>

      <Modal
        open={followupOpen}
        onClose={() => setFollowupOpen(false)}
        title="Schedule follow-up"
        subtitle="Sets the next follow-up date so this lead cannot be forgotten."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFollowupOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              onClick={() => { scheduleFollowup(lead.id, followupDate, followupAction.trim()); setFollowupAction(''); setFollowupOpen(false); }}
            >
              <CheckCircle2 size={14} /> Set follow-up
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="fdate">Follow-up date</Label>
            <Input id="fdate" type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Today', days: 0 },
              { label: 'Tomorrow', days: 1 },
              { label: 'In 3 days', days: 3 },
              { label: 'Next week', days: 7 },
            ].map((opt) => (
              <Button key={opt.label} type="button" variant="outline" size="sm" onClick={() => setFollowupDate(d(opt.days))}>
                {opt.label}
              </Button>
            ))}
          </div>
          <div>
            <Label htmlFor="faction">Next action</Label>
            <Input id="faction" value={followupAction} onChange={(e) => setFollowupAction(e.target.value)} placeholder={lead.next_action} />
          </div>
        </div>
      </Modal>

      <Modal
        open={lostOpen}
        onClose={() => setLostOpen(false)}
        title="Mark lead as lost"
        subtitle="Record why, so the pipeline stays honest and the reason can be reviewed later."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setLostOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!lostReason.trim()}
              onClick={() => { markLeadLost(lead.id, lostReason.trim()); setLostReason(''); setLostOpen(false); }}
            >
              <XCircle size={14} /> Mark as lost
            </Button>
          </>
        }
      >
        <Label htmlFor="lost">Reason</Label>
        <Textarea id="lost" value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder="e.g. Took a competing unit closer to town" />
      </Modal>
    </>
  );
}
