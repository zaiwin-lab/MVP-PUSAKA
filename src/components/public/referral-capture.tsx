'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Handshake, X } from 'lucide-react';
import { captureReferral, storedReferral } from '@/lib/referral';
import { referrers } from '@/lib/data/referrers';

/**
 * Captures `?ref=` / `?src=` on landing and holds attribution for the configured
 * window. Nothing about the referrer is exposed publicly beyond a quiet
 * acknowledgement that the visitor arrived through a partner.
 */
export function ReferralCapture() {
  const params = useSearchParams();
  const [name, setName] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ref = params.get('ref');
    const src = params.get('src') ?? params.get('utm_source');
    if (ref || src) captureReferral(ref, src);
    const code = ref ?? storedReferral();
    if (!code) return;
    const match = referrers.find((r) => r.code.toLowerCase() === code.toLowerCase() && r.status === 'approved');
    if (match && ref) setName(match.name.split(' ').slice(0, 2).join(' '));
  }, [params]);

  if (!name || dismissed) return null;

  return (
    <div className="border-b border-emerald-100 bg-emerald-50/80">
      <div className="container-page flex items-center justify-between gap-3 py-2.5">
        <p className="flex items-center gap-2 text-[12.5px] text-emerald-800">
          <Handshake size={15} className="shrink-0" />
          <span>
            You arrived through <strong className="font-semibold">{name}</strong>, a KO-PUSAKA referral partner. Your
            enquiry will be credited to them.
          </span>
        </p>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss" className="text-emerald-700/70 hover:text-emerald-900">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
