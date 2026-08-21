'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { PropertyImage } from '@/components/property-image';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { badgeLabel, propertyStatusLabel } from '@/lib/labels';
import { cn } from '@/lib/utils';

export function PropertyGallery({ property }: { property: Property }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const views = property.images.length ? property.images : ['facade'];
  const go = (delta: number) => setIndex((i) => (i + delta + views.length) % views.length);

  return (
    <>
      <div className="min-w-0 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <PropertyImage seed={property.code} type={property.type} view={views[index]} />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge tone={property.listing_intent === 'sale' ? 'ink' : 'emerald'} className="shadow-sm">
              {property.listing_intent === 'sale' ? 'For Sale' : 'For Rent'}
            </Badge>
            {property.badges.map((b) => (
              <Badge key={b} tone={b.startsWith('urgent') ? 'red' : 'gold'} className="shadow-sm">
                {badgeLabel[b]}
              </Badge>
            ))}
            <Badge tone="white" dot className="shadow-sm">
              {propertyStatusLabel[property.status]}
            </Badge>
          </div>

          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="Enlarge image"
            className="absolute right-4 top-4 rounded-lg bg-white/90 p-2 text-ink shadow-sm backdrop-blur transition hover:bg-white"
          >
            <Expand size={16} />
          </button>

          {views.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-ink shadow-sm backdrop-blur transition hover:bg-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-ink shadow-sm backdrop-blur transition hover:bg-white"
              >
                <ChevronRight size={18} />
              </button>
              <p className="absolute bottom-4 right-4 rounded-lg bg-ink/70 px-2.5 py-1 text-[11.5px] font-medium text-white backdrop-blur">
                {index + 1} / {views.length}
              </p>
            </>
          ) : null}
        </div>

        {views.length > 1 ? (
          <div className="scrollbar-slim flex gap-2 overflow-x-auto p-3">
            {views.map((view, i) => (
              <button
                key={view + i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                  i === index ? 'border-emerald-600' : 'border-transparent opacity-70 hover:opacity-100',
                )}
                aria-label={`View ${view}`}
              >
                <PropertyImage seed={property.code} type={property.type} view={view} />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {zoom ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setZoom(false)}
          role="presentation"
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl">
            <PropertyImage seed={property.code} type={property.type} view={views[index]} />
          </div>
        </div>
      ) : null}
    </>
  );
}
