import type { Locale } from '@/i18n/config';

/** رابط داخلي بلغة الصفحة:  to('ar', '/shop') → /ar/shop */
export function to(lang: Locale, path = ''): string {
  if (!path || path === '/') return `/${lang}`;
  if (path.startsWith('#')) return `/${lang}${path}`;
  return `/${lang}${path.startsWith('/') ? path : `/${path}`}`;
}
