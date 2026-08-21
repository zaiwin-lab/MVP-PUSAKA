import type { Metadata } from 'next';
import { PropertyDetail } from '@/components/public/property-detail';
import { DemoPropertyFallback } from '@/components/public/demo-property-fallback';
import { propertyBySlug } from '@/lib/data/properties';
import { publicProperties, relatedProperties } from '@/lib/public';
import { SITE_URL } from '@/lib/data/settings';
import { formatCurrency } from '@/lib/utils';

export function generateStaticParams() {
  return publicProperties().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = propertyBySlug(slug);
  if (!property) return { title: 'Property not found' };
  const price =
    property.listing_intent === 'sale'
      ? `${formatCurrency(property.sale_price)}`
      : `${formatCurrency(property.asking_rent)} per month`;
  const title = `${property.name}, ${property.location} — ${property.listing_intent === 'sale' ? 'For Sale' : 'For Rent'}`;
  const description = `${property.type} in ${property.district}, ${property.location}. ${price}. ${property.description.slice(0, 130)}…`;
  return {
    title,
    description,
    alternates: { canonical: `/property/${property.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/property/${property.slug}`,
      type: 'website',
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = propertyBySlug(slug);

  // Properties added inside the running demo live in the client store rather
  // than the seeded dataset, so they are rendered through the fallback.
  if (!property || !property.published) return <DemoPropertyFallback slug={slug} />;

  return <PropertyDetail property={property} related={relatedProperties(property)} />;
}

export const dynamicParams = true;
