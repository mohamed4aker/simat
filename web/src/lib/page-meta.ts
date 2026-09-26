import type { Metadata } from 'next';
import { hasLocale } from '@/i18n/config';

/** عنوان ووصف وروابط اللغتين لصفحة محتوى. */
export async function pageMeta(
  params: Promise<{ lang: string }>,
  path: string,
  pick: (lang: 'ar' | 'en') => { title: string; description?: string },
): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { title, description } = pick(lang);
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}${path}`,
      languages: { ar: `/ar${path}`, en: `/en${path}` },
    },
  };
}
