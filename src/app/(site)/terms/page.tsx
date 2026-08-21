import type { Metadata } from 'next';
import { LegalPage } from '@/components/public/legal-page';

export const metadata: Metadata = { title: 'Terms of Use', alternates: { canonical: '/terms' } };

export default function Page() {
  return <LegalPage slug="terms" />;
}
