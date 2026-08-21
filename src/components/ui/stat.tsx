import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Stat({
  label, value, sub, tone = 'default', href, icon, className, trend,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: 'default' | 'emerald' | 'gold' | 'red' | 'dark';
  href?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: { value: string; direction: 'up' | 'down' | 'flat' };
}) {
  const tones = {
    default: 'bg-white border-line',
    emerald: 'bg-emerald-50/70 border-emerald-100',
    gold: 'bg-gold-50 border-gold-200/70',
    red: 'bg-red-50/70 border-red-100',
    dark: 'bg-ink border-ink text-white',
  };
  const isDark = tone === 'dark';

  const body = (
    <div
      className={cn(
        'group relative flex h-full flex-col justify-between rounded-2xl border p-4 shadow-card transition-all duration-200 sm:p-5',
        tones[tone],
        href && 'hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.12em]', isDark ? 'text-white/60' : 'text-ink-muted')}>
          {label}
        </p>
        {icon ? <span className={cn('shrink-0', isDark ? 'text-white/50' : 'text-emerald-600/70')}>{icon}</span> : null}
      </div>
      <div className="mt-3">
        <p className={cn('stat-figure', isDark && 'text-white')}>{value}</p>
        {sub ? (
          <p className={cn('mt-1.5 text-[12.5px] leading-snug', isDark ? 'text-white/60' : 'text-ink-muted')}>{sub}</p>
        ) : null}
        {trend ? (
          <p
            className={cn(
              'mt-2 inline-flex items-center gap-1 text-[12px] font-semibold',
              trend.direction === 'up' ? 'text-emerald-600' : trend.direction === 'down' ? 'text-red-600' : 'text-ink-muted',
            )}
          >
            {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '—'} {trend.value}
          </p>
        ) : null}
      </div>
      {href ? (
        <span
          className={cn(
            'pointer-events-none absolute bottom-4 right-4 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100',
            isDark ? 'text-white/70' : 'text-emerald-600',
          )}
        >
          View →
        </span>
      ) : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full focus-visible:rounded-2xl">
      {body}
    </Link>
  ) : (
    body
  );
}

export function MiniStat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'red' | 'gold' | 'emerald' }) {
  return (
    <div className="rounded-xl border border-line bg-white px-3.5 py-3">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft">{label}</p>
      <p
        className={cn(
          'mt-1 font-display text-xl font-semibold text-ink',
          tone === 'red' && 'text-red-600',
          tone === 'gold' && 'text-gold-600',
          tone === 'emerald' && 'text-emerald-700',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function Progress({ value, tone = 'emerald', className }: { value: number; tone?: 'emerald' | 'gold' | 'red'; className?: string }) {
  const tones = { emerald: 'bg-emerald-500', gold: 'bg-gold-400', red: 'bg-red-500' };
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div className={cn('h-full rounded-full transition-all duration-500', tones[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
