import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/ar/checkout', '/en/checkout',
        '/ar/order-received', '/en/order-received',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
