/**
 * بيختار النص المناسب للغة الصفحة من بيانات المنتج.
 * لو الترجمة الإنجليزي فاضية بنرجع للعربي (والعكس) عشان الصفحة
 * متطلعش فاضية أبداً.
 */
import type { Locale } from '@/i18n/config';
import type { CartLine, Category, Product } from './types';

const pick = (ar: string, en: string, lang: Locale) =>
  lang === 'en' ? en || ar : ar || en;

const pickList = (ar: string[], en: string[], lang: Locale) =>
  lang === 'en' ? (en.length ? en : ar) : ar.length ? ar : en;

export function productText(p: Product, lang: Locale) {
  return {
    name: pick(p.name, p.nameEn, lang),
    description: pick(p.description, p.descriptionEn, lang),
    family: pick(p.family, p.familyEn, lang),
    top: pickList(p.topNotes, p.topNotesEn, lang),
    heart: pickList(p.heartNotes, p.heartNotesEn, lang),
    base: pickList(p.baseNotes, p.baseNotesEn, lang),
  };
}

export function productName(p: Pick<Product, 'name' | 'nameEn'>, lang: Locale) {
  return pick(p.name, p.nameEn, lang);
}

export function lineName(l: CartLine, lang: Locale) {
  return pick(l.name, l.nameEn, lang);
}

export function categoryName(c: Category, lang: Locale) {
  return pick(c.name, c.nameEn, lang);
}

/** اسم العطر من غير كلمة «SIMAT/سِمة» — للملصق الصغير على الزجاجة. */
export function shortName(p: Pick<Product, 'nameEn'>): string {
  return p.nameEn.replace(/^SIMAT\s+/i, '').split(' (')[0];
}
