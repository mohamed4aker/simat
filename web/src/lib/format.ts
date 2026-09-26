import { STORE } from './constants';
import type { Locale } from '@/i18n/config';

const money = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const int = new Intl.NumberFormat('en-US');

/** «3,450 ج.م» أو «3,450 EGP» حسب اللغة. */
export function price(value: number, lang: Locale = 'ar'): string {
  return `${money.format(value)} ${lang === 'en' ? 'EGP' : STORE.currency}`;
}

export function priceNumber(value: number): string {
  return money.format(value);
}

export function number(value: number): string {
  return int.format(value);
}

export function dateAr(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function dateTimeAr(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function discountPercent(price: number, oldPrice: number | null): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/** تطبيع الحروف العربية عشان البحث يشتغل مع الهمزات والتاء المربوطة. */
export function normalizeArabic(value: string): string {
  return value
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ً-ْ]/g, '')
    .trim();
}

/** التاريخ حسب لغة الصفحة. */
export function dateFor(value: string | Date, lang: Locale): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}
