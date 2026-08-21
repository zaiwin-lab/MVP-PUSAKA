import { cn } from '@/lib/utils';

export function PageHeader({
  eyebrow, title, subtitle, action, className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-[30px]">
          {title}
        </h1>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}
