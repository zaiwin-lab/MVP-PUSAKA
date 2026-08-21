'use client';

import { settings } from '@/lib/data/settings';

const COOKIE = 'kps_ref';
const CAMPAIGN_COOKIE = 'kps_src';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

function writeCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Attribution is captured the moment a visitor lands on `?ref=` (or `/r/CODE`)
 * and held for the configured window, so an enquiry submitted days later still
 * credits the right referrer.
 */
export function captureReferral(code: string | null, source?: string | null) {
  if (code) writeCookie(COOKIE, code.toUpperCase(), settings.attribution_window_days);
  if (source) writeCookie(CAMPAIGN_COOKIE, source, settings.attribution_window_days);
}

export function storedReferral(): string | null {
  return readCookie(COOKIE);
}

export function storedCampaign(): string | null {
  return readCookie(CAMPAIGN_COOKIE);
}

export function clearReferral() {
  writeCookie(COOKIE, '', -1);
}
