import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PropertyExplorer } from '@/components/public/property-explorer';
import { publicLocations, publicProperties, publicTypes } from '@/lib/public';

export const metadata: Metadata = {
  title: 'Properties for Rent & Sale in Sarawak',
  description:
    'Search KO-PUSAKA properties by location, type, price and size. Shoplots, offices, warehouses, land and homes available for rent or purchase across Sarawak.',
  alternates: { canonical: '/properties' },
};

export default function PropertiesPage() {
  return (
    <div className="border-t border-line bg-canvas">
      <Suspense fallback={<div className="container-page py-16 text-sm text-ink-muted">Loading properties…</div>}>
        <PropertyExplorer properties={publicProperties()} locations={publicLocations()} types={publicTypes()} />
      </Suspense>
    </div>
  );
}
