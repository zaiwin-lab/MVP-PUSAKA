import type { MetadataRoute } from 'next';
import { publicProperties } from '@/lib/public';
import { SITE_URL } from '@/lib/data/settings';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/properties', '/for-rent', '/for-sale', '/about', '/become-a-referrer', '/contact', '/privacy', '/terms', '/referral-policy'];
  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.7,
    })),
    ...publicProperties().map((p) => ({
      url: `${SITE_URL}/property/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
}
