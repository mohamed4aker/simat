// كتالوج سِمة — عطور شيت المنتجات (طقم العينات اتشال بطلب العميل).
// بيُستخدم في وضع العرض (من غير قاعدة بيانات)، وكمان بيتحوّل لـ SQL
// في supabase/seed.sql (npm run gen:seed) عشان يتزرع في قاعدة البيانات.

import { catalogRows } from './catalog.data.ts';
import { DEFAULT_SIZE } from './pricing.ts';
import type { Category, Coupon, Product, Review } from './types';

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString();

export const categories: Category[] = [
  {
    id: 'cat_signature',
    slug: 'signature',
    name: 'عطور سِمة',
    nameEn: 'SIMAT Fragrances',
    description: 'ماء عطر بأحجام 40 و60 و100 مل',
    descriptionEn: 'Eau de Parfum in 40, 60 and 100 ml',
    iconKey: 'bottle',
    sortOrder: 1,
  },
];

const empty = {
  brand: 'SIMAT',
  oldPrice: null,
  isActive: true,
  imageUrl: null,
  hoverImageUrl: null,
  rating: 0,
  ratingCount: 0,
};

/** عطور سِمة من شيت المنتجات بأسعار العميل. */
const sheetProducts: Product[] = catalogRows.map((r) => ({
  ...empty,
  id: r.id,
  slug: r.slug,
  // الأسماء إنجليزي زي ما هي، والمحتوى عربي + إنجليزي من الشيت.
  name: r.nameEn,
  nameEn: r.nameEn,
  categoryId: 'cat_signature',
  description: r.description,
  descriptionEn: r.descriptionEn,
  family: r.family,
  familyEn: r.familyEn,
  kind: 'bottle',
  labelStyle: r.labelStyle,
  secondaryLine: r.secondaryLine,
  tagline: r.tagline,
  taglineAr: r.taglineAr,
  shortDescription: r.shortDescription,
  shortDescriptionAr: r.shortDescriptionAr,
  scentCharacter: r.scentCharacter,
  scentCharacterAr: r.scentCharacterAr,
  accords: [...r.accords],
  accordsAr: [...r.accordsAr],
  wearProfile: r.wearProfile,
  wearProfileAr: r.wearProfileAr,
  occasion: r.occasion,
  occasionAr: r.occasionAr,
  related: [...r.related],
  imageUrl: r.imageUrl,
  hoverImageUrl: r.hoverImageUrl,
  variants: r.variants.map((v) => ({ ...v })),
  price: r.variants.find((v) => v.sizeMl === DEFAULT_SIZE)?.price ?? 0,
  sizeMl: DEFAULT_SIZE,
  gender: r.gender,
  concentration: 'edp',
  topNotes: [...r.topNotes],
  heartNotes: [...r.heartNotes],
  baseNotes: [...r.baseNotes],
  topNotesEn: [...r.topNotesEn],
  heartNotesEn: [...r.heartNotesEn],
  baseNotesEn: [...r.baseNotesEn],
  longevityHours: 8,
  stock: 50,
  soldCount: r.soldCount,
  isFeatured: r.isFeatured,
  createdAt: daysAgo(r.sheetId),
}));

export const products: Product[] = sheetProducts;

export const coupons: Coupon[] = [
  {
    code: 'SIMAT10',
    type: 'percent',
    value: 10,
    minOrder: 0,
    maxDiscount: null,
    expiresAt: daysAgo(-365),
    usageLimit: 0,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'ALEXANDRIA',
    type: 'percent',
    value: 10,
    minOrder: 0,
    maxDiscount: null,
    expiresAt: daysAgo(-365),
    usageLimit: 0,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'SIMAT15',
    type: 'percent',
    value: 15,
    minOrder: 3000,
    maxDiscount: null,
    expiresAt: daysAgo(-365),
    usageLimit: 0,
    usedCount: 0,
    isActive: true,
  },
];

/** التقييمات بتتضاف من لوحة التحكم — مفيش تقييمات وهمية في الكتالوج. */
export const reviews: Review[] = [];
