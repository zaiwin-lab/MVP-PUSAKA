'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import type { PropertyType } from '@/lib/types';

export function PropertySearchBar({
  locations, types, className, defaults,
}: {
  locations: string[];
  types: PropertyType[];
  className?: string;
  defaults?: { intent?: string; location?: string; type?: string; q?: string };
}) {
  const router = useRouter();
  const [intent, setIntent] = useState(defaults?.intent ?? 'all');
  const [location, setLocation] = useState(defaults?.location ?? '');
  const [type, setType] = useState(defaults?.type ?? '');
  const [q, setQ] = useState(defaults?.q ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (intent && intent !== 'all') params.set('intent', intent);
    if (location) params.set('location', location);
    if (type) params.set('type', type);
    if (q.trim()) params.set('q', q.trim());
    router.push(`/properties${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <form
      onSubmit={submit}
      className={cn('rounded-2xl border border-line bg-white p-3 shadow-lift sm:p-3.5', className)}
    >
      <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'rent', label: 'Rent' },
          { key: 'sale', label: 'Buy' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setIntent(tab.key)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-[13px] font-semibold transition-all',
              intent === tab.key ? 'bg-white text-emerald-700 shadow-sm' : 'text-ink-muted hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <Input
          placeholder="Search by name, area or keyword"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Keyword"
        />
        <Select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location">
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Property type">
          <option value="">All property types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Button type="submit" size="md" className="w-full lg:w-auto lg:px-7">
          <Search size={16} /> Search
        </Button>
      </div>
    </form>
  );
}
