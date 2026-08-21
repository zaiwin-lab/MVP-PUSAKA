import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/data/settings';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/portal/', '/referrer/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
