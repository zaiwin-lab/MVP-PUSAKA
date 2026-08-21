'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldGroup, Input, Label, Select, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { useStore } from '@/lib/store';
import { leadSourceLabel } from '@/lib/labels';
import type { ContactMethod, LeadInterest, LeadSourceKey } from '@/lib/types';

/** Officers log walk-in, phone and event enquiries through the same intake path. */
export function NewLeadModal() {
  const router = useRouter();
  const { data, submitEnquiry } = useStore();
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const propertyId = String(form.get('property_id') ?? '');
    const lead = submitEnquiry({
      name: String(form.get('name')),
      phone: String(form.get('phone')),
      email: String(form.get('email') ?? ''),
      company: String(form.get('company') ?? ''),
      property_id: propertyId || null,
      interest: String(form.get('interest')) as LeadInterest,
      preferred_contact: String(form.get('contact')) as ContactMethod,
      message: String(form.get('message') ?? ''),
      referral_code: String(form.get('referral_code') ?? '') || null,
      source: String(form.get('source')) as LeadSourceKey,
    });
    setOpen(false);
    router.push(`/portal/leads/${lead.id}`);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <UserPlus size={14} /> Log enquiry
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Log an enquiry"
        subtitle="For walk-ins, phone calls and enquiries taken at events."
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="nl-name">Prospect name</Label>
              <Input id="nl-name" name="name" required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="nl-phone">Phone</Label>
              <Input id="nl-phone" name="phone" type="tel" required placeholder="+60 12-345 6789" />
            </FieldGroup>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="nl-email" hint="optional">Email</Label>
              <Input id="nl-email" name="email" type="email" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="nl-company" hint="optional">Company</Label>
              <Input id="nl-company" name="company" />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="nl-property">Property enquired about</Label>
            <Select id="nl-property" name="property_id" defaultValue="">
              <option value="">General enquiry</option>
              {data.properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </FieldGroup>

          <div className="grid gap-3 sm:grid-cols-3">
            <FieldGroup>
              <Label htmlFor="nl-interest">Interested in</Label>
              <Select id="nl-interest" name="interest" defaultValue="rent">
                <option value="rent">Renting</option>
                <option value="buy">Buying</option>
                <option value="viewing">Viewing</option>
                <option value="info">More information</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="nl-contact">Preferred contact</Label>
              <Select id="nl-contact" name="contact" defaultValue="whatsapp">
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone call</option>
                <option value="email">Email</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="nl-source">Source</Label>
              <Select id="nl-source" name="source" defaultValue="walk_in">
                {Object.entries(leadSourceLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="nl-ref" hint="optional">Referral code</Label>
            <Select id="nl-ref" name="referral_code" defaultValue="">
              <option value="">No referrer</option>
              {data.referrers.filter((r) => r.status === 'approved').map((r) => (
                <option key={r.id} value={r.code}>{r.code} — {r.name}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="nl-message">Requirement</Label>
            <Textarea id="nl-message" name="message" placeholder="What are they looking for?" />
          </FieldGroup>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm">Create lead</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
