'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';
import { Logo } from '@/components/brand';
import { ButtonLink } from '@/components/ui/button';
import { WHATSAPP_NUMBER } from '@/lib/data/settings';
import { cn, whatsappLink } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/for-rent', label: 'For Rent' },
  { href: '/for-sale', label: 'For Sale' },
  { href: '/about', label: 'About KO-PUSAKA' },
  { href: '/become-a-referrer', label: 'Become a Referrer' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-200',
        scrolled ? 'border-line bg-white/90 backdrop-blur-md' : 'border-transparent bg-white',
      )}
    >
      <div className="container-page flex h-[68px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors',
                  active ? 'text-emerald-700' : 'text-ink-muted hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink
            href={whatsappLink(WHATSAPP_NUMBER, 'Hello KO-PUSAKA, I would like to enquire about a property.')}
            external
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Phone size={15} /> WhatsApp Us
          </ButtonLink>
          <ButtonLink href="/portal" variant="primary" size="sm" className="hidden md:inline-flex">
            Management Portal
          </ButtonLink>
          <button
            type="button"
            className="rounded-lg p-2 text-ink lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="animate-fade-in border-t border-line bg-white lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2 py-3 text-[15px] font-medium text-ink hover:bg-emerald-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ButtonLink href="/portal" variant="outline" size="sm">
                Management Portal
              </ButtonLink>
              <ButtonLink href="/referrer" variant="primary" size="sm">
                Referrer Login
              </ButtonLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
