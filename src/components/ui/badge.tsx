import { cn } from '@/lib/utils';

type Tone = 'emerald' | 'gold' | 'slate' | 'red' | 'blue' | 'amber' | 'white' | 'ink';

const tones: Record<Tone, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  gold: 'bg-gold-50 text-gold-600 ring-gold-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  blue: 'bg-sky-50 text-sky-700 ring-sky-200',
  white: 'bg-white/90 text-ink ring-white/60 backdrop-blur',
  ink: 'bg-ink text-white ring-ink',
};

export function Badge({
  children, tone = 'slate', className, dot,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function HealthDot({ health, className }: { health: 'green' | 'amber' | 'red'; className?: string }) {
  const map = { green: 'bg-emerald-500', amber: 'bg-gold-400', red: 'bg-red-500' };
  return <span className={cn('inline-block h-2.5 w-2.5 shrink-0 rounded-full', map[health], className)} />;
}
