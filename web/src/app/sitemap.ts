import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getProducts } from '@/lib/store';

export const revalidate = 3600;

/** كل صفحة بتتسجل مرة بالعربي ومرة بالإنجليزي مع الربط بينهم. */
function entry(path: string, priority: number, lastModified = new Date()) {
  return {
    url: `${SITE_URL}/ar${path}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority,
    alternates: {
      languages: {
        ar: `${SITE_URL}/ar${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const pages = [
    entry('', 1),
    entry('/shop', 0.9),
    entry('/faq', 0.6),
    entry('/about', 0.5),
    entry('/shipping', 0.5),
    entry('/contact', 0.4),
    entry('/privacy', 0.3),
    entry('/track', 0.4),
    ...products.map((p) => entry(`/product/${p.slug}`, 0.8, new Date(p.createdAt))),
  ];

  // نفس الصفحات بالإنجليزي كعناوين مستقلة
  return pages.flatMap((p) => [
    p,
    { ...p, url: p.url.replace(`${SITE_URL}/ar`, `${SITE_URL}/en`) },
  ]);
}
