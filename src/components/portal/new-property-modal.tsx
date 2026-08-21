'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldGroup, Input, Label, Select, Textarea } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { useStore } from '@/lib/store';
import { PROPERTY_TYPES } from '@/lib/public';
import { propertyStatusLabel } from '@/lib/labels';
import type { ListingIntent, PropertyStatus, PropertyType } from '@/lib/types';

export function NewPropertyModal() {
  const router = useRouter();
  const { data, addProperty } = useStore();
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<ListingIntent>('rent');

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const num = (key: string) => Number(String(form.get(key) ?? '').replace(/[^\d.]/g, '')) || 0;
    const property = addProperty({
      name: String(form.get('name')),
      type: String(form.get('type')) as PropertyType,
      address: String(form.get('address')),
      location: String(form.get('location')),
      district: String(form.get('district')),
      asset_value: num('asset_value'),
      asking_rent: intent === 'sale' ? null : num('asking_rent') || null,
      sale_price: intent === 'rent' ? null : num('sale_price') || null,
      floor_size_sqft: num('floor_size'),
      land_size_sqft: num('land_size') || null,
      officer_id: String(form.get('officer_id')),
      description: String(form.get('description')),
      status: String(form.get('status')) as PropertyStatus,
      listing_intent: intent,
      published: form.get('published') === 'on',
    });
    setOpen(false);
    router.push(`/portal/properties/${property.id}`);
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} /> Add property
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a property"
        subtitle="The essentials now — photographs, documents and facilities can follow."
        size="lg"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="np-name">Property name</Label>
              <Input id="np-name" name="name" required placeholder="e.g. Batu Lintang Corner Shoplot" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="np-type">Property type</Label>
              <Select id="np-type" name="type" defaultValue="Shoplot">
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="np-address">Address</Label>
            <Input id="np-address" name="address" required placeholder="Lot number, street" />
          </FieldGroup>

          <div className="grid gap-3 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="np-district">District / area</Label>
              <Input id="np-district" name="district" required placeholder="e.g. Batu Lintang" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="np-location">Town, state</Label>
              <Input id="np-location" name="location" required defaultValue="Kuching, Sarawak" />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label>Listing intent</Label>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'rent', label: 'For rent' },
                { key: 'sale', label: 'For sale' },
                { key: 'both', label: 'Rent or sale' },
                { key: 'none', label: 'Not marketed' },
              ] as { key: ListingIntent; label: string }[]).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setIntent(opt.key)}
                  className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition ${
                    intent === opt.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FieldGroup>

          <div className="grid gap-3 sm:grid-cols-3">
            <FieldGroup>
              <Label htmlFor="np-asset">Estimated asset value (RM)</Label>
              <Input id="np-asset" name="asset_value" inputMode="numeric" placeholder="1500000" />
            </FieldGroup>
            {intent !== 'sale' ? (
              <FieldGroup>
                <Label htmlFor="np-rent">Monthly asking rent (RM)</Label>
                <Input id="np-rent" name="asking_rent" inputMode="numeric" placeholder="5500" />
              </FieldGroup>
            ) : null}
            {intent === 'sale' || intent === 'both' ? (
              <FieldGroup>
                <Label htmlFor="np-price">Asking sale price (RM)</Label>
                <Input id="np-price" name="sale_price" inputMode="numeric" placeholder="1800000" />
              </FieldGroup>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FieldGroup>
              <Label htmlFor="np-floor">Floor size (sq ft)</Label>
              <Input id="np-floor" name="floor_size" inputMode="numeric" placeholder="2400" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="np-land">Land size (sq ft)</Label>
              <Input id="np-land" name="land_size" inputMode="numeric" placeholder="1400" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="np-status">Status</Label>
              <Select id="np-status" name="status" defaultValue="available_rent">
                {Object.entries(propertyStatusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="np-officer">Officer responsible</Label>
            <Select id="np-officer" name="officer_id" defaultValue="usr-0003">
              {data.users.filter((u) => ['officer', 'property_manager', 'super_admin'].includes(u.role)).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="np-desc">Description</Label>
            <Textarea id="np-desc" name="description" placeholder="How would you describe this property to a prospective tenant or buyer?" />
          </FieldGroup>

          <label className="flex items-center gap-3 rounded-xl border border-line bg-slate-50/60 p-4 text-[13px] text-ink-muted">
            <input type="checkbox" name="published" defaultChecked className="h-4 w-4 rounded border-line text-emerald-600 focus:ring-emerald-500" />
            Publish immediately on the public marketplace
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm">Create property</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
