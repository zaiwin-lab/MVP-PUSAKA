import Link from 'next/link';
import { Logo } from '@/components/brand';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo />
      <p className="eyebrow mt-10">404</p>
      <h1 className="mt-3 font-display text-[32px] font-semibold tracking-tight text-ink">
        That page is no longer listed
      </h1>
      <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-ink-muted">
        The property may have been let, sold or taken off the market. Browse everything currently
        available, or speak to the KO-PUSAKA property team.
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
