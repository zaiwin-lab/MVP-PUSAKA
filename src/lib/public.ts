import { properties } from '@/lib/data/properties';
import type { Property, PropertyType } from '@/lib/types';

export const PROPERTY_TYPES: PropertyType[] = [
  'Shoplot', 'Office', 'Commercial', 'Residential', 'Industrial', 'Land', 'Warehouse', 'Other',
];

/** Only published, marketable listings ever reach the public site. */
export function publicProperties(): Property[] {
  return properties.filter((p) => p.published && p.status !== 'sold' && p.status !== 'inactive');
}

export function featuredProperties(limit = 6): Property[] {
  return [...publicProperties()]
    .sort((a, b) => {
      const score = (p: Property) =>
        (p.badges.includes('featured') ? 4 : 0) +
        (p.badges.includes('new_listing') ? 2 : 0) +
        (p.badges.includes('urgent_rent') || p.badges.includes('urgent_sale') ? 1 : 0);
      return score(b) - score(a) || (a.date_listed! < b.date_listed! ? 1 : -1);
    })
    .slice(0, limit);
}

export function relatedProperties(property: Property, limit = 3): Property[] {
  const pool = publicProperties().filter((p) => p.id !== property.id);
  return [
    ...pool.filter((p) => p.type === property.type),
    ...pool.filter((p) => p.type !== property.type && p.location === property.location),
    ...pool.filter((p) => p.type !== property.type && p.location !== property.location),
  ]
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, limit);
}

export function publicLocations(): string[] {
  return [...new Set(publicProperties().map((p) => p.location))].sort();
}

export function publicTypes(): PropertyType[] {
  return [...new Set(publicProperties().map((p) => p.type))].sort() as PropertyType[];
}

export const priceBands = [
  { label: 'Any price', min: '', max: '' },
  { label: 'Under RM3,000 / month', min: '0', max: '3000' },
  { label: 'RM3,000 – RM8,000 / month', min: '3000', max: '8000' },
  { label: 'RM8,000 – RM20,000 / month', min: '8000', max: '20000' },
  { label: 'Above RM20,000 / month', min: '20000', max: '' },
];
