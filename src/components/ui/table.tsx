import { cn } from '@/lib/utils';

export function TableWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('scrollbar-slim w-full overflow-x-auto', className)}>
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className, align }: { children?: React.ReactNode; className?: string; align?: 'right' | 'center' }) {
  return (
    <th
      className={cn(
        'whitespace-nowrap border-b border-line bg-slate-50/60 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, align }: { children?: React.ReactNode; className?: string; align?: 'right' | 'center' }) {
  return (
    <td
      className={cn(
        'border-b border-line/70 px-4 py-3 align-middle text-[13.5px] text-ink',
        align === 'right' && 'text-right tabular-nums',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr className={cn('transition-colors hover:bg-emerald-50/40', onClick && 'cursor-pointer', className)} onClick={onClick}>
      {children}
    </tr>
  );
}

export function EmptyState({ title, detail, action }: { title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-slate-50/50 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {detail ? <p className="max-w-sm text-[13px] text-ink-muted">{detail}</p> : null}
      {action}
    </div>
  );
}
