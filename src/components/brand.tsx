import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logomark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} aria-hidden>
      <rect width="40" height="40" rx="11" fill="currentColor" />
      <path d="M11 27.5V12.5h3.4v6.3l5.5-6.3h4.2l-5.9 6.6 6.3 8.4h-4.3l-4.4-6-1.4 1.6v4.4H11Z" fill="#fff" />
      <circle cx="28.5" cy="15" r="2.6" fill="#e4c26d" />
      <path d="M25.6 27.5v-6.6a2.9 2.9 0 0 1 5.8 0v6.6h-2.6v-6.2a.3.3 0 0 0-.6 0v6.2h-2.6Z" fill="#fff" opacity=".85" />
    </svg>
  );
}

export function Logo({ className, tone = 'dark', href = '/' }: { className?: string; tone?: 'dark' | 'light'; href?: string }) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2.5', className)}>
      <Logomark className={cn('h-9 w-9 transition-transform group-hover:scale-[1.04]', tone === 'light' ? 'text-white' : 'text-emerald-700')} />
      <span className="leading-none">
        <span className={cn('block font-display text-[17px] font-semibold tracking-tight', tone === 'light' ? 'text-white' : 'text-ink')}>
          KO-PUSAKA
        </span>
        <span className={cn('mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.22em]', tone === 'light' ? 'text-white/60' : 'text-emerald-600')}>
          Asset360
        </span>
      </span>
    </Link>
  );
}

export function DemoRibbon() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600 ring-1 ring-inset ring-gold-200">
      Demo data
    </span>
  );
}
