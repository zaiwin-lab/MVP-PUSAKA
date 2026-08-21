'use client';

import Link from 'next/link';
import { PropertyDetail } from '@/components/public/property-detail';
import { useStore } from '@/lib/store';
import type { Property } from '@/lib/types';

/**
 * Properties created inside the running prototype are held in the client store,
 * not the seeded dataset, so they have no statically generated page. This
 * fallback renders them with the same detail view — and shows the standard
 * "no longer listed" message when nothing matches.
 */
export function DemoPropertyFallback({ slug }: { slug: string }) {
  const { data, hydrated } = useStore();
  const property = data.properties.find((p) => p.slug === slug && p.published) ?? null;

  if (!property) {
    if (!hydrated) return <div className="container-page py-24" />;
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <p className="eyebrow">Not available</p>
        <h1 className="mt-3 font-display text-[30px] font-semibold tracking-tight text-ink">
          That property is no longer listed
        </h1>
        <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-ink-muted">
          It may have been let, sold or taken off the market. Browse everything currently available,
          or speak to the KO-PUSAKA property team.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/properties" className="inline-flex h-11 items-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Browse available properties
          </Link>
          <Link href="/contact" className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-5 text-sm font-semibold text-ink transition hover:border-emerald-300">
            Contact the team
          </Link>
        </div>
      </div>
    );
  }

  const related: Property[] = data.properties
    .filter((p) => p.id !== property.id && p.published)
    .sort((a, b) => (a.type === property.type ? -1 : 1))
    .slice(0, 3);

  return <PropertyDetail property={property} related={related} />;
}
