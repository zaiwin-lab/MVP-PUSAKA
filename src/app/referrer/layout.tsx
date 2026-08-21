import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referrer Dashboard',
  description: 'Share KO-PUSAKA properties and track the enquiries, viewings and deals credited to you.',
  robots: { index: false, follow: false },
};

export default function ReferrerLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-canvas">{children}</div>;
}
