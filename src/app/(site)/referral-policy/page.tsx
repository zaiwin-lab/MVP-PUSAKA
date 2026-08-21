import type { Metadata } from 'next';
import { LegalPage } from '@/components/public/legal-page';

export const metadata: Metadata = { title: 'Referral Policy', alternates: { canonical: '/referral-policy' } };

export default function Page() {
  return <LegalPage slug="referral-policy" />;
}
