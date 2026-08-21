import Link from 'next/link';
import { ArrowUpRight, Bath, BedDouble, Car, MapPin, Maximize } from 'lucide-react';
import { PropertyImage } from '@/components/property-image';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { badgeLabel, propertyStatusLabel, propertyStatusTone } from '@/lib/labels';
import { cn, formatCurrency, formatSqft } from '@/lib/utils';

function priceLine(property: Property) {
  if (property.listing_intent === 'sale' || (!property.asking_rent && property.sale_price)) {
    return { value: formatCurrency(property.sale_price), unit: 'sale price' };
  }
  return { value: formatCurrency(property.asking_rent), unit: 'per month' };
}

export function PropertyCard({ property, className }: { property: Property; className?: string }) {
  const price = priceLine(property);
  const primaryBadge = property.badges[0];

  return (
    <Link
      href={`/property/${property.slug}`}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]">
          <PropertyImage seed={property.code} type={property.type} view={property.images[0]} />
        </div>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge tone={property.listing_intent === 'sale' ? 'ink' : 'emerald'} className="shadow-sm">
            {property.listing_intent === 'sale' ? 'For Sale' : 'For Rent'}
          </Badge>
          {primaryBadge ? (
            <Badge tone={primaryBadge.startsWith('urgent') ? 'red' : 'gold'} className="shadow-sm">
              {badgeLabel[primaryBadge]}
            </Badge>
          ) : null}
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge tone="white" dot className="shadow-sm">
            {propertyStatusLabel[property.status]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-600">{property.type}</p>
        <h3 className="mt-1.5 font-display text-[17px] font-semibold leading-snug text-ink transition-colors group-hover:text-emerald-700">
          {property.name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-muted">
          <MapPin size={13} className="shrink-0 text-ink-soft" />
          {property.district}, {property.location}
        </p>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Maximize size={13} className="text-ink-soft" />
            {property.type === 'Land' ? formatSqft(property.land_size_sqft) : formatSqft(property.floor_size_sqft)}
          </span>
          {property.bedrooms ? (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble size={13} className="text-ink-soft" />
              {property.bedrooms}
            </span>
          ) : null}
          {property.bathrooms ? (
            <span className="inline-flex items-center gap-1.5">
              <Bath size={13} className="text-ink-soft" />
              {property.bathrooms}
            </span>
          ) : null}
          {property.car_parks ? (
            <span className="inline-flex items-center gap-1.5">
              <Car size={13} className="text-ink-soft" />
              {property.car_parks}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="font-display text-[22px] font-semibold leading-none text-ink">{price.value}</p>
            <p className="mt-1 text-[11.5px] uppercase tracking-[0.08em] text-ink-soft">{price.unit}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-[12.5px] font-semibold text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            View Property <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PropertyRow({ property }: { property: Property }) {
  const price = priceLine(property);
  return (
    <Link
      href={`/property/${property.slug}`}
      className="group grid grid-cols-1 gap-4 overflow-hidden rounded-2xl border border-line bg-white p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift sm:grid-cols-[220px_1fr]"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 sm:aspect-auto sm:h-full">
        <PropertyImage seed={property.code} type={property.type} view={property.images[0]} />
        <div className="absolute left-2.5 top-2.5">
          <Badge tone={property.listing_intent === 'sale' ? 'ink' : 'emerald'}>
            {property.listing_intent === 'sale' ? 'For Sale' : 'For Rent'}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col py-2 pr-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-600">{property.type}</p>
          <Badge tone={propertyStatusTone[property.status]}>{propertyStatusLabel[property.status]}</Badge>
        </div>
        <h3 className="mt-1.5 font-display text-[17px] font-semibold text-ink group-hover:text-emerald-700">{property.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-muted">
          <MapPin size={13} className="text-ink-soft" /> {property.address}
        </p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">{property.description}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-ink-muted">
            <span>{property.type === 'Land' ? formatSqft(property.land_size_sqft) : formatSqft(property.floor_size_sqft)}</span>
            <span>ID {property.code}</span>
          </div>
          <div className="text-right">
            <p className="font-display text-[21px] font-semibold leading-none text-ink">{price.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-ink-soft">{price.unit}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
