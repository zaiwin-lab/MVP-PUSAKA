import type { Metadata } from 'next';
import { LegalPage } from '@/components/public/legal-page';

export const metadata: Metadata = { title: 'Privacy Statement', alternates: { canonical: '/privacy' } };

export default function Page() {
  return <LegalPage slug="privacy" />;
}
