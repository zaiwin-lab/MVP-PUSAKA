import { cn } from '@/lib/utils';

export function Card({ className, children, as: Tag = 'div' }: { className?: string; children: React.ReactNode; as?: 'div' | 'section' | 'article' }) {
  return <Tag className={cn('min-w-0 rounded-2xl border border-line bg-white shadow-card', className)}>{children}</Tag>;
}

export function CardHeader({
  title, subtitle, action, className, icon,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4', className)}>
      <div className="flex items-start gap-3">
        {icon ? <div className="mt-0.5 text-emerald-600">{icon}</div> : null}
        <div>
          <h3 className="text-[15px] font-semibold leading-tight text-ink">{title}</h3>
          {subtitle ? <p className="mt-1 text-[13px] leading-snug text-ink-muted">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
