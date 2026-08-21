'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldGroup, Input, Label, Select, Textarea } from '@/components/ui/field';
import { settings } from '@/lib/data/settings';

export function ReferrerApplicationForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [agreed, setAgreed] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setTimeout(() => setState('done'), 600);
  };

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
        <CheckCircle2 size={38} className="mx-auto text-emerald-600" />
        <h3 className="mt-4 font-display text-[22px] font-semibold text-ink">Application submitted</h3>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-muted">
          Thank you. KO-PUSAKA reviews every referrer application before activation. Once approved you
          will receive your referral code, personal link and QR code by email — usually within three
          working days.
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={() => setState('idle')}>
          Submit another application
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="r-name">Full name</Label>
          <Input id="r-name" name="name" required placeholder="As per identification document" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="r-ic" hint="stored securely">IC / ID number</Label>
          <Input id="r-ic" name="ic" required placeholder="000000-00-0000" />
        </FieldGroup>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="r-org" hint="optional">Company / organisation</Label>
          <Input id="r-org" name="organisation" placeholder="Company, cooperative or association" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="r-occupation">Occupation</Label>
          <Input id="r-occupation" name="occupation" required placeholder="e.g. Business consultant" />
        </FieldGroup>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="r-phone">Phone</Label>
          <Input id="r-phone" name="phone" type="tel" required placeholder="+60 12-345 6789" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="r-email">Email</Label>
          <Input id="r-email" name="email" type="email" required placeholder="you@email.com" />
        </FieldGroup>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="r-type">Referral type</Label>
          <Select id="r-type" name="type" required defaultValue="">
            <option value="" disabled>Select one</option>
            <option value="staff">KO-PUSAKA staff</option>
            <option value="member">Cooperative member</option>
            <option value="partner">Business partner</option>
            <option value="agent">Registered property agent</option>
            <option value="public">Member of the public</option>
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="r-bank" hint="only if incentives are later approved">Bank account (placeholder)</Label>
          <Input id="r-bank" name="bank" placeholder="Bank name and account number" />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="r-note" hint="optional">Which properties or networks can you help with?</Label>
        <Textarea id="r-note" name="note" placeholder="e.g. I work with F&B operators looking for shoplots in Kuching and Samarahan." />
      </FieldGroup>

      <label className="flex items-start gap-3 rounded-xl border border-line bg-slate-50/60 p-4 text-[13px] leading-relaxed text-ink-muted">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-emerald-600 focus:ring-emerald-500"
        />
        <span>
          I agree to represent KO-PUSAKA properties accurately, to refer genuine prospects only, and I
          understand that {settings.referral_policy_note.charAt(0).toLowerCase() + settings.referral_policy_note.slice(1)}
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!agreed || state === 'sending'}>
        {state === 'sending' ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} />}
        {state === 'sending' ? 'Submitting…' : 'Submit application'}
      </Button>
    </form>
  );
}
