import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck, Building2, CalendarClock, ChevronRight, Download, FileText, LandPlot, MapPin,
  MessageCircle, Ruler, ShieldCheck, Sparkles, Users,
} from 'lucide-react';
import { PropertyGallery } from '@/components/public/property-gallery';
import { EnquiryForm } from '@/components/public/enquiry-form';
import { ShareTools } from '@/components/public/share-tools';
import { StickyCta } from '@/components/public/sticky-cta';
import { PropertyCard } from '@/components/public/property-card';
import { PropertyMap } from '@/components/public/property-map';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { propertyBySlug } from '@/lib/data/properties';
import { publicProperties, relatedProperties } from '@/lib/public';
import { SITE_URL, WHATSAPP_NUMBER, settings } from '@/lib/data/settings';
import { propertyStatusLabel, propertyStatusTone } from '@/lib/labels';
import { formatCurrency, formatSqft, whatsappLink } from '@/lib/utils';
import { formatDate } from '@/lib/dates';

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
  if (!property || !property.published) notFound();

  const related = relatedProperties(property);
  const isSale = property.listing_intent === 'sale';
  const waText = `Hello KO-PUSAKA, I am interested in ${property.name} (${property.code}). Please share more details.`;

  const specs = [
    { label: 'Property ID', value: property.code, icon: FileText },
    { label: 'Property type', value: property.type, icon: Building2 },
    { label: 'Floor size', value: property.floor_size_sqft ? formatSqft(property.floor_size_sqft) : '—', icon: Ruler },
    { label: 'Land size', value: formatSqft(property.land_size_sqft), icon: LandPlot },
    ...(property.bedrooms ? [{ label: 'Bedrooms', value: String(property.bedrooms), icon: Users }] : []),
    ...(property.bathrooms ? [{ label: 'Bathrooms', value: String(property.bathrooms), icon: Users }] : []),
    ...(property.car_parks ? [{ label: 'Car parks', value: String(property.car_parks), icon: Users }] : []),
    { label: 'Availability', value: propertyStatusLabel[property.status], icon: CalendarClock },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.name,
    description: property.description,
    url: `${SITE_URL}/property/${property.slug}`,
    datePosted: property.date_listed,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.location.split(',')[0],
      addressRegion: 'Sarawak',
      addressCountry: 'MY',
    },
    geo: { '@type': 'GeoCoordinates', latitude: property.lat, longitude: property.lng },
    offers: {
      '@type': 'Offer',
      price: isSale ? property.sale_price : property.asking_rent,
      priceCurrency: 'MYR',
      availability: property.status === 'occupied' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    },
    provider: { '@type': 'Organization', name: 'KO-PUSAKA' },
  };

  return (
    <div className="pb-24 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-t border-line bg-white">
        <div className="container-page flex flex-wrap items-center gap-1.5 py-3 text-[12.5px] text-ink-muted">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight size={13} className="text-ink-soft" />
          <Link href="/properties" className="hover:text-emerald-700">Properties</Link>
          <ChevronRight size={13} className="text-ink-soft" />
          <Link href={`/properties?type=${encodeURIComponent(property.type)}`} className="hover:text-emerald-700">
            {property.type}
          </Link>
          <ChevronRight size={13} className="text-ink-soft" />
          <span className="text-ink">{property.name}</span>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        {/* -------------------------------------------------------- Main column */}
        <div className="min-w-0 space-y-8">
          <PropertyGallery property={property} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={propertyStatusTone[property.status]} dot>
                {propertyStatusLabel[property.status]}
              </Badge>
              <Badge tone="emerald">
                <BadgeCheck size={12} /> Verified Property
              </Badge>
              <span className="text-[12px] text-ink-soft">Last updated {formatDate(property.updated_at)}</span>
            </div>

            <h1 className="mt-3 font-display text-[30px] font-semibold leading-tight tracking-tight text-ink sm:text-[38px]">
              {property.name}
            </h1>
            <p className="mt-2.5 flex items-start gap-2 text-[14.5px] text-ink-muted">
              <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              {property.address}, {property.location}
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-4 border-y border-line py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                  {isSale ? 'Asking sale price' : 'Asking rental'}
                </p>
                <p className="mt-1.5 font-display text-[32px] font-semibold leading-none text-ink">
                  {formatCurrency(isSale ? property.sale_price : property.asking_rent)}
                  {!isSale ? <span className="ml-1.5 text-[15px] font-medium text-ink-muted">/ month</span> : null}
                </p>
              </div>
              {!isSale && property.deposit ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">Indicative deposit</p>
                  <p className="mt-1.5 font-display text-[20px] font-semibold leading-none text-ink">
                    {formatCurrency(property.deposit)}
                  </p>
                </div>
              ) : null}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                  {property.type === 'Land' ? 'Land size' : 'Floor size'}
                </p>
                <p className="mt-1.5 font-display text-[20px] font-semibold leading-none text-ink">
                  {formatSqft(property.type === 'Land' ? property.land_size_sqft : property.floor_size_sqft)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <ButtonLink href="#enquire" size="lg">Enquire Now</ButtonLink>
              <ButtonLink href="#enquire" variant="outline" size="lg">Request a Viewing</ButtonLink>
              <ButtonLink href={whatsappLink(WHATSAPP_NUMBER, waText)} external variant="outline" size="lg">
                <MessageCircle size={17} className="text-emerald-600" /> WhatsApp Us
              </ButtonLink>
            </div>
          </div>

          <Card>
            <CardHeader title="Property specifications" icon={<Ruler size={16} />} />
            <CardBody className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">{spec.label}</p>
                  <p className="mt-1.5 text-[14px] font-semibold text-ink">{spec.value}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="About this property" icon={<Sparkles size={16} />} />
            <CardBody className="space-y-6">
              <p className="text-[14.5px] leading-relaxed text-ink-muted">{property.description}</p>

              <div>
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-ink">Key features</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {property.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-[13.5px] text-ink-muted">
                      <BadgeCheck size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-ink">Facilities</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {property.facilities.map((f) => (
                    <span key={f} className="rounded-lg bg-slate-50 px-3 py-1.5 text-[12.5px] text-ink-muted ring-1 ring-inset ring-line">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Location"
              subtitle={`${property.district}, ${property.location} · ${property.lat.toFixed(4)}° N, ${property.lng.toFixed(4)}° E`}
              icon={<MapPin size={16} />}
            />
            <CardBody>
              <PropertyMap properties={[property]} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Documents & brochure" icon={<FileText size={16} />} />
            <CardBody className="space-y-2">
              {property.documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <FileText size={16} />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-medium text-ink">{doc.name}</p>
                      <p className="text-[11.5px] text-ink-soft">{doc.kind} · {doc.size}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink-muted">
                    <Download size={13} /> On request
                  </span>
                </div>
              ))}
              <p className="pt-1 text-[12px] text-ink-soft">
                Brochures are released by the responsible officer once an enquiry is received.
              </p>
            </CardBody>
          </Card>
        </div>

        {/* ----------------------------------------------------------- Sidebar */}
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-24">
          <Card>
            <CardHeader
              title="Enquire about this property"
              subtitle="Short form — about 30 seconds. An officer responds within one working day."
            />
            <CardBody>
              <EnquiryForm propertyId={property.id} propertyName={property.name} defaultInterest={isSale ? 'buy' : 'rent'} compact />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Share this property" icon={<MessageCircle size={16} />} />
            <CardBody>
              <ShareTools url={`/property/${property.slug}`} title={property.name} location={property.location} />
            </CardBody>
          </Card>

          <Card className="bg-emerald-50/50">
            <CardBody className="space-y-3.5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-emerald-800">
                <ShieldCheck size={16} /> Managed directly by KO-PUSAKA
              </p>
              <ul className="space-y-2 text-[12.5px] leading-relaxed text-ink-muted">
                <li>Property ID <strong className="font-semibold text-ink">{property.code}</strong></li>
                <li>Listed on {formatDate(property.date_listed)}</li>
                <li>Information last updated {formatDate(property.updated_at)}</li>
                <li>Enquiries handled by the KO-PUSAKA property team, not a third-party agent</li>
              </ul>
              <div className="hairline pt-3 text-[12px] text-ink-soft">
                {settings.contact_phone} · {settings.contact_email}
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>

      {related.length ? (
        <section className="container-page pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Related properties</p>
              <h2 className="mt-2 font-display text-[24px] font-semibold tracking-tight text-ink sm:text-[28px]">
                You may also consider
              </h2>
            </div>
            <ButtonLink href="/properties" variant="outline" size="sm">View all</ButtonLink>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      ) : null}

      <StickyCta propertyName={property.name} code={property.code} />
    </div>
  );
}

export const dynamicParams = true;
