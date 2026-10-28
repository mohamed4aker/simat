import type { Locale } from '@/i18n/config';

/** رابط داخلي بلغة الصفحة:  to('ar', '/shop') → /ar/shop */
export function to(lang: Locale, path = ''): string {
  if (!path || path === '/') return `/${lang}`;
  // لينك كامل أو فيه اللغة أصلاً (من لوحة التحكم) — بيتساب زي ما هو.
  if (/^https?:\/\//.test(path) || /^\/(ar|en)(\/|\?|#|$)/.test(path)) return path;
  if (path.startsWith('#')) return `/${lang}${path}`;
  return `/${lang}${path.startsWith('/') ? path : `/${path}`}`;
}
