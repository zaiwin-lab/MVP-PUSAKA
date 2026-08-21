import { NextResponse } from 'next/server';
import { referrers } from '@/lib/data/referrers';
import { settings } from '@/lib/data/settings';

/**
 * Referral entry point — `asset.kopusaka.my/r/KPS-A1023`.
 * Stamps the attribution cookie server-side, then hands the visitor to the
 * marketplace so the link works even before any client JavaScript runs.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalised = decodeURIComponent(code).toUpperCase();
  const referrer = referrers.find((r) => r.code.toUpperCase() === normalised && r.status === 'approved');
  const url = new URL(request.url);
  const target = new URL(url.searchParams.get('to') ?? '/properties', url.origin);

  if (!referrer) {
    target.searchParams.set('ref_invalid', '1');
    return NextResponse.redirect(target, { status: 307 });
  }

  target.searchParams.set('ref', referrer.code);
  const response = NextResponse.redirect(target, { status: 307 });
  response.cookies.set('kps_ref', referrer.code, {
    maxAge: settings.attribution_window_days * 86_400,
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
