import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { StoreProvider } from '@/lib/store';
import { SITE_URL } from '@/lib/data/settings';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', axes: ['SOFT', 'WONK'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'KO-PUSAKA Asset360 — Property for Rent & Sale in Sarawak',
    template: '%s | KO-PUSAKA Asset360',
  },
  description:
    'Explore selected commercial, residential and strategic properties available for rent or purchase from KO-PUSAKA. Enquire directly, request a viewing and speak to the property team.',
  keywords: ['KO-PUSAKA', 'property for rent Sarawak', 'shoplot Kuching', 'warehouse Bintulu', 'commercial property Sibu', 'office Miri'],
  openGraph: {
    type: 'website',
    siteName: 'KO-PUSAKA Asset360',
    title: 'KO-PUSAKA Asset360 — From Idle Assets to Active Income',
    description: 'Selected commercial, residential and strategic properties available for rent or purchase.',
    locale: 'en_MY',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#194e3a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-MY" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
