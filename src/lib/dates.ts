/**
 * The demo dataset is anchored to the day the app is loaded so the prototype
 * always looks alive — follow-ups due "today" really are today. Every seeded
 * date is expressed as an offset from this anchor, which keeps the whole
 * dataset internally consistent (a tenancy that expires in 24 days always
 * expires in 24 days).
 */
const anchor = new Date();
export const TODAY = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());

export function iso(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Date string `n` days from the anchor (negative = past). */
export function d(offsetDays: number): string {
  const dt = new Date(TODAY);
  dt.setDate(dt.getDate() + offsetDays);
  return iso(dt);
}

/** Datetime string `n` days from the anchor at a given hour. */
export function dt(offsetDays: number, hour = 10, minute = 0): string {
  const date = new Date(TODAY);
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/** Period key (YYYY-MM) `n` months from the anchor month. */
export function period(offsetMonths: number): string {
  const date = new Date(TODAY.getFullYear(), TODAY.getMonth() + offsetMonths, 1);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
}

export function periodLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
}

export function daysBetween(from: string, to: string = d(0)): number {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Positive = in the future. */
export function daysUntil(target: string): number {
  return -daysBetween(target);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value.length > 10 ? value : `${value}T00:00:00`);
  return date.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  return date.toLocaleString('en-MY', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function relativeDays(value: string | null): string {
  if (!value) return '—';
  const diff = daysBetween(value.slice(0, 10));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff === -1) return 'Tomorrow';
  if (diff > 0) return `${diff} days ago`;
  return `in ${Math.abs(diff)} days`;
}
