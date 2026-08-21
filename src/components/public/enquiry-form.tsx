'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldGroup, Input, Label, Select, Textarea } from '@/components/ui/field';
import { useStore } from '@/lib/store';
import { storedReferral } from '@/lib/referral';
import type { ContactMethod, LeadInterest } from '@/lib/types';
import { cn } from '@/lib/utils';

const interests: { key: LeadInterest; label: string }[] = [
  { key: 'rent', label: 'Renting' },
  { key: 'buy', label: 'Buying' },
  { key: 'viewing', label: 'Viewing' },
  { key: 'info', label: 'More Information' },
];

export function EnquiryForm({
  propertyId, propertyName, defaultInterest = 'rent', compact, id = 'enquire',
}: {
  propertyId: string | null;
  propertyName?: string;
  defaultInterest?: LeadInterest;
  compact?: boolean;
  id?: string;
}) {
  const { submitEnquiry } = useStore();
  const [interest, setInterest] = useState<LeadInterest>(defaultInterest);
  const [contact, setContact] = useState<ContactMethod>('whatsapp');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [ref, setRef] = useState<string | null>(null);
  const [reference, setReference] = useState<string>('');

  useEffect(() => setRef(storedReferral()), []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState('sending');
    // A short delay stands in for the network round-trip a Supabase insert will make.
    setTimeout(() => {
      const lead = submitEnquiry({
        name: String(form.get('name') ?? ''),
        phone: String(form.get('phone') ?? ''),
        email: String(form.get('email') ?? ''),
        company: String(form.get('company') ?? ''),
        property_id: propertyId,
        interest,
        preferred_contact: contact,
        message: String(form.get('message') ?? ''),
        referral_code: ref,
      });
      setReference(lead.code);
      setState('done');
    }, 550);
  };

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
        <CheckCircle2 size={34} className="mx-auto text-emerald-600" />
        <h3 className="mt-3 font-display text-[20px] font-semibold text-ink">Enquiry received</h3>
        <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-ink-muted">
          Thank you. Your enquiry reference is <strong className="font-semibold text-ink">{reference}</strong>. A
          KO-PUSAKA officer will contact you by your preferred method, usually within one working day.
          {ref ? ' Your enquiry has been credited to the referral partner who shared this property.' : ''}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setState('idle')}>
            Submit another enquiry
          </Button>
          <Link
            href="/portal/leads"
            className="inline-flex h-9 items-center rounded-xl bg-emerald-600 px-3.5 text-[13px] font-semibold text-white transition hover:bg-emerald-700"
          >
            See it appear in the CRM
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={onSubmit} className={cn('space-y-4', compact && 'space-y-3')}>
      {propertyName ? (
        <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-[12.5px] text-emerald-800">
          Enquiring about <strong className="font-semibold">{propertyName}</strong>
        </p>
      ) : null}

      <div className={cn('grid gap-3', !compact && 'sm:grid-cols-2')}>
        <FieldGroup>
          <Label htmlFor={`${id}-name`}>Name</Label>
          <Input id={`${id}-name`} name="name" required placeholder="Your full name" autoComplete="name" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor={`${id}-phone`}>Phone</Label>
          <Input id={`${id}-phone`} name="phone" required type="tel" placeholder="+60 12-345 6789" autoComplete="tel" />
        </FieldGroup>
      </div>

      <div className={cn('grid gap-3', !compact && 'sm:grid-cols-2')}>
        <FieldGroup>
          <Label htmlFor={`${id}-email`}>Email</Label>
          <Input id={`${id}-email`} name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor={`${id}-company`} hint="optional">Company</Label>
          <Input id={`${id}-company`} name="company" placeholder="Company or organisation" autoComplete="organization" />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label>Interested in</Label>
        <div className="flex flex-wrap gap-2">
          {interests.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setInterest(item.key)}
              className={cn(
                'rounded-xl border px-3.5 py-2 text-[13px] font-medium transition-all',
                interest === item.key
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-line bg-white text-ink-muted hover:border-emerald-300 hover:text-ink',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor={`${id}-contact`}>Preferred contact method</Label>
        <Select id={`${id}-contact`} value={contact} onChange={(e) => setContact(e.target.value as ContactMethod)}>
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Phone call</option>
          <option value="email">Email</option>
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor={`${id}-message`} hint="optional">Message</Label>
        <Textarea
          id={`${id}-message`}
          name="message"
          placeholder="Tell us your requirement — intended use, size, timing or budget."
          defaultValue=""
        />
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full" disabled={state === 'sending'}>
        {state === 'sending' ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} />}
        {state === 'sending' ? 'Sending…' : 'Send Enquiry'}
      </Button>

      <p className="text-[11.5px] leading-relaxed text-ink-soft">
        By submitting you agree that KO-PUSAKA may contact you about this enquiry. Your details are used
        only for this purpose. See our <Link href="/privacy" className="underline hover:text-ink">privacy statement</Link>.
        {ref ? ' This enquiry will be credited to the referral partner who shared this listing.' : ''}
      </p>
    </form>
  );
}
