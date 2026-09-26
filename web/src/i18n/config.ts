/**
 * إعدادات اللغات. الموقع بلغتين: العربي (الافتراضي) والإنجليزي.
 * كل صفحة ليها رابط بكل لغة:  /ar/shop  و  /en/shop
 */
export const locales = ['ar', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

/** الكوكي اللي بتفتكر اختيار الزائر للغة. */
export const LOCALE_COOKIE = 'simat_lang';

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dirOf(lang: Locale): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function otherLocale(lang: Locale): Locale {
  return lang === 'ar' ? 'en' : 'ar';
}

/** بيبدّل أول جزء في المسار: /ar/shop → /en/shop */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split('/');
  if (parts.length > 1 && hasLocale(parts[1])) {
    parts[1] = to;
    return parts.join('/') || `/${to}`;
  }
  return `/${to}${pathname === '/' ? '' : pathname}`;
}
