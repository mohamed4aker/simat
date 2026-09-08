import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getCategories, getProducts } from '@/lib/store';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const staticPages = [
    { url: '', priority: 1 },
    { url: '/shop', priority: 0.9 },
    { url: '/about', priority: 0.5 },
    { url: '/shipping', priority: 0.5 },
    { url: '/contact', priority: 0.4 },
    { url: '/privacy', priority: 0.3 },
    { url: '/track', priority: 0.4 },
  ].map((p) => ({
    url: `${SITE_URL}${p.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p.priority,
  }));

  return [
    ...staticPages,
    ...categories.map((c) => ({
      url: `${SITE_URL}/shop?category=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
