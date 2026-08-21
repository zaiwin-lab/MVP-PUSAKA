'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List, Map, SlidersHorizontal, X } from 'lucide-react';
import { PropertyCard, PropertyRow } from '@/components/public/property-card';
import { PropertyMap } from '@/components/public/property-map';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/field';
import { EmptyState } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import type { Property, PropertyType } from '@/lib/types';
import { cn } from '@/lib/utils';

type View = 'grid' | 'list' | 'map';

const sizeBands = [
  { label: 'Any size', min: 0 },
  { label: '1,000 sq ft and above', min: 1000 },
  { label: '2,500 sq ft and above', min: 2500 },
  { label: '5,000 sq ft and above', min: 5000 },
  { label: '20,000 sq ft and above', min: 20000 },
];

export function PropertyExplorer({
  properties: seeded, locations, types,
}: {
  properties: Property[];
  locations: string[];
  types: PropertyType[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  // The store starts from the same seed, so first render matches the server;
  // properties added during the demo then appear here automatically.
  const { data } = useStore();
  const properties = data.properties.filter((p) => p.published && p.status !== 'sold' && p.status !== 'inactive');
  void seeded;

  const [intent, setIntent] = useState(params.get('intent') ?? 'all');
  const [location, setLocation] = useState(params.get('location') ?? '');
  const [type, setType] = useState(params.get('type') ?? '');
  const [q, setQ] = useState(params.get('q') ?? '');
  const [min, setMin] = useState(params.get('min') ?? '');
  const [max, setMax] = useState(params.get('max') ?? '');
  const [minSize, setMinSize] = useState(0);
  const [availability, setAvailability] = useState(params.get('availability') ?? '');
  const [sort, setSort] = useState('recent');
  const [view, setView] = useState<View>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const list = properties.filter((p) => {
      if (intent === 'rent' && p.listing_intent === 'sale') return false;
      if (intent === 'sale' && p.listing_intent !== 'sale') return false;
      if (location && p.location !== location) return false;
      if (type && p.type !== type) return false;
      if (availability === 'available' && !['available_rent', 'available_sale'].includes(p.status)) return false;
      if (availability === 'negotiation' && p.status !== 'under_negotiation') return false;
      const price = p.listing_intent === 'sale' ? p.sale_price ?? 0 : p.asking_rent ?? 0;
      if (min && price < Number(min)) return false;
      if (max && price > Number(max)) return false;
      const size = p.type === 'Land' ? p.land_size_sqft ?? 0 : p.floor_size_sqft;
      if (minSize && size < minSize) return false;
      if (q) {
        const haystack = `${p.name} ${p.address} ${p.location} ${p.district} ${p.type} ${p.description} ${p.code} ${p.highlights.join(' ')}`.toLowerCase();
        if (!haystack.includes(q.toLowerCase())) return false;
      }
      return true;
    });

    const priceOf = (p: Property) => (p.listing_intent === 'sale' ? p.sale_price ?? 0 : p.asking_rent ?? 0);
    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => priceOf(a) - priceOf(b));
      case 'price-desc':
        return [...list].sort((a, b) => priceOf(b) - priceOf(a));
      case 'size':
        return [...list].sort((a, b) => (b.floor_size_sqft || b.land_size_sqft || 0) - (a.floor_size_sqft || a.land_size_sqft || 0));
      default:
        return [...list].sort((a, b) => (a.date_listed ?? '') < (b.date_listed ?? '') ? 1 : -1);
    }
  }, [properties, intent, location, type, availability, min, max, minSize, q, sort]);

  const activeFilters = [intent !== 'all', !!location, !!type, !!q, !!min, !!max, !!minSize, !!availability].filter(Boolean).length;

  const reset = () => {
    setIntent('all'); setLocation(''); setType(''); setQ(''); setMin(''); setMax(''); setMinSize(0); setAvailability('');
    router.replace('/properties');
  };

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <Label>Looking to</Label>
        <div className="inline-flex w-full rounded-xl bg-slate-100 p-1">
          {[{ key: 'all', label: 'All' }, { key: 'rent', label: 'Rent' }, { key: 'sale', label: 'Buy' }].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setIntent(tab.key)}
              className={cn(
                'flex-1 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all',
                intent === tab.key ? 'bg-white text-emerald-700 shadow-sm' : 'text-ink-muted hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="q">Keyword</Label>
        <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Shoplot, warehouse, Kuching…" />
      </div>

      <div>
        <Label htmlFor="loc">Location</Label>
        <Select id="loc" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
      </div>

      <div>
        <Label htmlFor="type">Property type</Label>
        <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="min">Min price</Label>
          <Input id="min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} placeholder="RM" />
        </div>
        <div>
          <Label htmlFor="max">Max price</Label>
          <Input id="max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} placeholder="RM" />
        </div>
      </div>

      <div>
        <Label htmlFor="size">Size</Label>
        <Select id="size" value={minSize} onChange={(e) => setMinSize(Number(e.target.value))}>
          {sizeBands.map((b) => <option key={b.label} value={b.min}>{b.label}</option>)}
        </Select>
      </div>

      <div>
        <Label htmlFor="avail">Availability</Label>
        <Select id="avail" value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="">Any status</option>
          <option value="available">Available now</option>
          <option value="negotiation">Under negotiation</option>
        </Select>
      </div>

      {activeFilters ? (
        <Button variant="outline" size="sm" className="w-full" onClick={reset}>
          <X size={14} /> Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-emerald-600" />
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">Filters</p>
          </div>
          {filterPanel}
        </div>
      </aside>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
              {intent === 'sale' ? 'Properties for sale' : intent === 'rent' ? 'Properties for rent' : 'All properties'}
            </h1>
            <p className="mt-1 text-[13.5px] text-ink-muted">
              {results.length === 1 ? '1 property matches' : `${results.length} properties match`} your search
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={14} /> Filters{activeFilters ? ` (${activeFilters})` : ''}
            </Button>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 w-auto text-[13px]" aria-label="Sort by">
              <option value="recent">Most recent</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="size">Largest size</option>
            </Select>
            <div className="inline-flex rounded-xl border border-line bg-white p-1">
              {([
                { key: 'grid', icon: LayoutGrid, label: 'Grid view' },
                { key: 'list', icon: List, label: 'List view' },
                { key: 'map', icon: Map, label: 'Map view' },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  aria-label={label}
                  onClick={() => setView(key)}
                  className={cn(
                    'rounded-lg p-2 transition-colors',
                    view === key ? 'bg-emerald-600 text-white' : 'text-ink-muted hover:bg-slate-100',
                  )}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {results.length === 0 ? (
            <EmptyState
              title="No properties match those filters"
              detail="Try widening the price range or clearing the location filter — new units are listed regularly."
              action={<Button className="mt-3" size="sm" onClick={reset}>Clear all filters</Button>}
            />
          ) : view === 'grid' ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : view === 'list' ? (
            <div className="space-y-4">
              {results.map((p) => <PropertyRow key={p.id} property={p} />)}
            </div>
          ) : (
            <PropertyMap properties={results} />
          )}
        </div>
      </section>

      {filtersOpen ? (
        <div className="fixed inset-0 z-[70] flex flex-col bg-ink/40 backdrop-blur-sm lg:hidden" onClick={() => setFiltersOpen(false)}>
          <div className="mt-auto max-h-[85vh] animate-fade-up overflow-y-auto rounded-t-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-ink">Filters</p>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="p-1.5 text-ink-muted">
                <X size={18} />
              </button>
            </div>
            {filterPanel}
            <Button className="mt-5 w-full" onClick={() => setFiltersOpen(false)}>
              Show {results.length} {results.length === 1 ? 'property' : 'properties'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
