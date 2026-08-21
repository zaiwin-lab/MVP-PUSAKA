import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined, opts: { compact?: boolean; decimals?: boolean } = {}) {
  if (value === null || value === undefined) return '—';
  if (opts.compact) {
    if (Math.abs(value) >= 1_000_000) return `RM${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2)}m`;
    if (Math.abs(value) >= 1_000) return `RM${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}k`;
  }
  return `RM${value.toLocaleString('en-MY', {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  })}`;
}

export function formatNumber(value: number, decimals = 0) {
  return value.toLocaleString('en-MY', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(value: number, decimals = 0) {
  return `${value.toFixed(decimals)}%`;
}

export function formatSqft(value: number | null | undefined) {
  if (!value) return '—';
  return `${value.toLocaleString('en-MY')} sq ft`;
}

export function initialsOf(name: string) {
  return name
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function uid(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export function whatsappLink(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export function truncate(value: string, length = 120) {
  return value.length <= length ? value : `${value.slice(0, length - 1).trimEnd()}…`;
}
