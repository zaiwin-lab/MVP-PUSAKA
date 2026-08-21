import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/brand';
import { settings } from '@/lib/data/settings';

const columns = [
  {
    title: 'Properties',
    links: [
      { href: '/properties', label: 'All Properties' },
      { href: '/for-rent', label: 'For Rent' },
      { href: '/for-sale', label: 'For Sale' },
      { href: '/properties?type=Shoplot', label: 'Shoplots' },
      { href: '/properties?type=Warehouse', label: 'Warehouses' },
    ],
  },
  {
    title: 'KO-PUSAKA',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/become-a-referrer', label: 'Referral Network' },
      { href: '/portal', label: 'Management Portal' },
      { href: '/referrer', label: 'Referrer Dashboard' },
    ],
  },
  {
    title: 'Information',
    links: [
      { href: '/privacy', label: 'Privacy Statement' },
      { href: '/terms', label: 'Terms of Use' },
      { href: '/referral-policy', label: 'Referral Policy' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-muted">
            {settings.tagline}. A managed portfolio of commercial, residential and strategic
            properties across Sarawak — listed, marketed and monitored in one place.
          </p>
          <ul className="mt-5 space-y-2.5 text-[13px] text-ink-muted">
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 shrink-0 text-emerald-600" />
              {settings.office_address}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="shrink-0 text-emerald-600" />
              {settings.contact_phone}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="shrink-0 text-emerald-600" />
              {settings.contact_email}
            </li>
          </ul>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13.5px] text-ink-muted transition-colors hover:text-emerald-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-[12px] text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KO-PUSAKA. All rights reserved. Prototype populated with demo data.</p>
          <p>Properties managed directly by KO-PUSAKA. Information is indicative and subject to confirmation.</p>
        </div>
      </div>
    </footer>
  );
}
