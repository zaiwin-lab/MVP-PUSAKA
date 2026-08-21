'use client';

import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Lead, LeadStage } from '@/lib/types';
import { leadStageShort } from '@/lib/labels';
import { cn, whatsappLink } from '@/lib/utils';

const stageTone: Record<LeadStage, 'slate' | 'blue' | 'emerald' | 'gold' | 'red' | 'ink'> = {
  new: 'blue',
  contacted: 'slate',
  qualified: 'slate',
  viewing_scheduled: 'gold',
  viewing_completed: 'gold',
  negotiation: 'gold',
  offer: 'gold',
  agreement: 'emerald',
  successful: 'emerald',
  lost: 'red',
};

export function StageBadge({ stage }: { stage: LeadStage }) {
  return <Badge tone={stageTone[stage]}>{leadStageShort[stage]}</Badge>;
}

export function QuickContact({ lead, size = 'md', onLog }: { lead: Lead; size?: 'sm' | 'md'; onLog?: (kind: 'call' | 'whatsapp' | 'email') => void }) {
  const cls = cn(
    'inline-flex items-center justify-center rounded-lg border border-line bg-white text-ink-muted transition hover:border-emerald-300 hover:text-emerald-700',
    size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
  );
  const icon = size === 'sm' ? 14 : 15;
  const waText = `Hello ${lead.name.split(' ')[0]}, this is KO-PUSAKA following up on your property enquiry (${lead.code}).`;

  return (
    <div className="flex items-center gap-1.5">
      <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className={cls} aria-label="Call" title="Call" onClick={() => onLog?.('call')}>
        <Phone size={icon} />
      </a>
      <a
        href={whatsappLink(lead.phone, waText)}
        target="_blank"
        rel="noreferrer noopener"
        className={cls}
        aria-label="WhatsApp"
        title="WhatsApp"
        onClick={() => onLog?.('whatsapp')}
      >
        <MessageCircle size={icon} />
      </a>
      <a
        href={`mailto:${lead.email}?subject=${encodeURIComponent(`KO-PUSAKA property enquiry ${lead.code}`)}`}
        className={cls}
        aria-label="Email"
        title="Email"
        onClick={() => onLog?.('email')}
      >
        <Mail size={icon} />
      </a>
    </div>
  );
}

export function FollowupChip({ date, className }: { date: string | null; className?: string }) {
  if (!date) return <span className={cn('text-[12px] text-ink-soft', className)}>No follow-up set</span>;
  const today = new Date();
  const target = new Date(`${date}T00:00:00`);
  const diff = Math.round((target.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86_400_000);
  const tone = diff < 0 ? 'text-red-600 bg-red-50' : diff === 0 ? 'text-gold-600 bg-gold-50' : 'text-ink-muted bg-slate-50';
  const label = diff < 0 ? `${Math.abs(diff)}d overdue` : diff === 0 ? 'Due today' : `in ${diff}d`;
  return <span className={cn('rounded-md px-2 py-1 text-[11.5px] font-semibold', tone, className)}>{label}</span>;
}
