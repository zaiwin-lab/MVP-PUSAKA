'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const base =
  'w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-ink-soft transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50';

export function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium text-ink">
      <span>{children}</span>
      {hint ? <span className="text-[11px] font-normal text-ink-soft">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, 'h-11', className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        base,
        'h-11 appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke-width=\'2\' stroke=\'%235c6672\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat pr-10',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, 'min-h-[104px] py-2.5', className)} {...props} />;
}

export function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('space-y-1', className)}>{children}</div>;
}
