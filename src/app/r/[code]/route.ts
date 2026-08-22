import { referrers } from '@/lib/data/referrers';
import { settings } from '@/lib/data/settings';

/**
 * Referral entry point — `asset.kopusaka.my/r/KPS-A1023`.
 * Stamps the attribution cookie server-side, then hands the visitor to the
 * marketplace so the link works even before any client JavaScript runs.
 *
 * The Location header is relative on purpose: the browser resolves it against
 * whichever host the visitor used, so a shared link never pins itself to a
 * preview or deploy-specific domain.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalised = decodeURIComponent(code).toUpperCase();
  const referrer = referrers.find((r) => r.code.toUpperCase() === normalised && r.status === 'approved');

  const requested = new URL(request.url).searchParams.get('to');
  const path = requested && requested.startsWith('/') ? requested : '/properties';
  const separator = path.includes('?') ? '&' : '?';

  if (!referrer) {
    return new Response(null, {
      status: 307,
      headers: { location: `${path}${separator}ref_invalid=1` },
    });
  }

  return new Response(null, {
    status: 307,
    headers: {
      location: `${path}${separator}ref=${encodeURIComponent(referrer.code)}`,
      'set-cookie': `kps_ref=${referrer.code}; Max-Age=${settings.attribution_window_days * 86_400}; Path=/; SameSite=Lax`,
    },
  });
}
