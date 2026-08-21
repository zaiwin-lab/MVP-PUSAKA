import { ImageResponse } from 'next/og';
import { propertyBySlug } from '@/lib/data/properties';
import { publicProperties } from '@/lib/public';
import { formatCurrency, formatSqft } from '@/lib/utils';

export const alt = 'KO-PUSAKA property listing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return publicProperties().map((p) => ({ slug: p.slug }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = propertyBySlug(slug);
  const price = property
    ? property.listing_intent === 'sale'
      ? formatCurrency(property.sale_price)
      : `${formatCurrency(property.asking_rent)} / month`
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #143c2d 0%, #1f6248 60%, #2f7d5b 100%)',
          padding: 64,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 16, background: 'white', color: '#194e3a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700,
            }}
          >
            K
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>KO-PUSAKA</span>
            <span style={{ fontSize: 15, letterSpacing: 4, color: '#e4c26d' }}>ASSET360</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span
            style={{
              alignSelf: 'flex-start', background: '#e4c26d', color: '#14181c', padding: '8px 18px',
              borderRadius: 999, fontSize: 20, fontWeight: 700, letterSpacing: 1,
            }}
          >
            {property?.listing_intent === 'sale' ? 'FOR SALE' : 'FOR RENT'}
          </span>
          <span style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.05, maxWidth: 980 }}>
            {property?.name ?? 'KO-PUSAKA Property'}
          </span>
          <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.78)' }}>
            {property ? `${property.district}, ${property.location}` : 'Sarawak, Malaysia'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 17, letterSpacing: 3, color: 'rgba(255,255,255,0.6)' }}>ASKING</span>
            <span style={{ fontSize: 44, fontWeight: 700 }}>{price}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.75)' }}>
              {property ? formatSqft(property.type === 'Land' ? property.land_size_sqft : property.floor_size_sqft) : ''}
            </span>
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.75)' }}>{property?.code ?? ''}</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
