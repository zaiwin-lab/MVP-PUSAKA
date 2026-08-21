'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Property } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';

/**
 * A schematic locator map. It plots each property by its real coordinates inside
 * a normalised frame — no external tile service, so it always renders. Swap the
 * frame for Mapbox/Google tiles later without touching the surrounding page.
 */
export function PropertyMap({ properties, className }: { properties: Property[]; className?: string }) {
  const [active, setActive] = useState<Property | null>(properties[0] ?? null);

  if (!properties.length) return null;

  const lats = properties.map((p) => p.lat);
  const lngs = properties.map((p) => p.lng);
  const pad = 0.6;
  const minLat = Math.min(...lats) - pad;
  const maxLat = Math.max(...lats) + pad;
  const minLng = Math.min(...lngs) - pad;
  const maxLng = Math.max(...lngs) + pad;

  const pos = (p: Property) => ({
    left: `${((p.lng - minLng) / (maxLng - minLng)) * 100}%`,
    top: `${(1 - (p.lat - minLat) / (maxLat - minLat)) * 100}%`,
  });

  return (
    <div className={cn('grid gap-4 lg:grid-cols-[1.6fr_1fr]', className)}>
      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-line bg-emerald-50/50 shadow-card sm:h-[520px]">
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <pattern id="mapgrid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M44 0H0v44" fill="none" stroke="#1f6248" strokeOpacity="0.07" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapgrid)" />
          <path d="M-20 320 C 140 250, 260 380, 420 300 S 720 260, 900 340" fill="none" stroke="#2f7d5b" strokeOpacity="0.16" strokeWidth="26" strokeLinecap="round" />
          <path d="M120 -20 C 180 160, 90 300, 220 520" fill="none" stroke="#b98c2c" strokeOpacity="0.12" strokeWidth="18" strokeLinecap="round" />
        </svg>

        {properties.map((p) => {
          const isActive = active?.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p)}
              style={pos(p)}
              className={cn(
                'group absolute -translate-x-1/2 -translate-y-full transition-all duration-200',
                isActive ? 'z-20 scale-110' : 'z-10 hover:scale-105',
              )}
              aria-label={p.name}
            >
              <span
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold shadow-lift ring-1',
                  isActive ? 'bg-emerald-700 text-white ring-emerald-700' : 'bg-white text-ink ring-line',
                )}
              >
                <MapPin size={12} className={isActive ? 'text-gold-300' : 'text-emerald-600'} />
                {formatCurrency(p.asking_rent ?? p.sale_price, { compact: true })}
              </span>
              <span className={cn('mx-auto block h-2 w-2 rotate-45 -translate-y-1 rounded-[1px]', isActive ? 'bg-emerald-700' : 'bg-white ring-1 ring-line')} />
            </button>
          );
        })}

        <p className="absolute bottom-3 left-3 rounded-lg bg-white/85 px-2.5 py-1.5 text-[11px] text-ink-muted backdrop-blur">
          Schematic locator — positions plotted from property coordinates
        </p>
      </div>

      {active ? (
        <div className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-600">{active.type}</p>
          <h3 className="mt-1.5 font-display text-[19px] font-semibold leading-snug text-ink">{active.name}</h3>
          <p className="mt-1.5 text-[13px] text-ink-muted">{active.address}</p>
          <p className="mt-4 font-display text-[24px] font-semibold text-ink">
            {formatCurrency(active.asking_rent ?? active.sale_price)}
            <span className="ml-1.5 text-[13px] font-medium text-ink-muted">
              {active.listing_intent === 'sale' ? 'sale price' : '/ month'}
            </span>
          </p>
          <p className="mt-4 line-clamp-4 text-[13.5px] leading-relaxed text-ink-muted">{active.description}</p>
          <div className="mt-auto pt-5">
            <Link
              href={`/property/${active.slug}`}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              View property
            </Link>
            <p className="mt-3 text-center text-[11.5px] text-ink-soft">
              {active.lat.toFixed(4)}° N, {active.lng.toFixed(4)}° E
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
