import type { Metadata } from 'next';
import { PortalShell } from '@/components/portal/portal-shell';

export const metadata: Metadata = {
  title: { default: 'Management Portal', template: '%s | KO-PUSAKA Asset360' },
  description: 'KO-PUSAKA Asset360 internal property command centre.',
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
