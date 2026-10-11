// كتالوج سِمة — عطور شيت المنتجات (55 عطر) + طقم العينات.
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
  {
    id: 'cat_discovery',
    slug: 'discovery',
    name: 'أطقم العينات',
    nameEn: 'Discovery Sets',
    description: 'جرب في البيت قبل ما تقرر',
    descriptionEn: 'Try at home before you decide',
    iconKey: 'gift',
    sortOrder: 2,
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

const discoverySet: Product = {
  ...empty,
  id: 'discovery-set',
  slug: 'discovery-set',
  name: 'طقم عينات سِمة (5 × 2 مل)',
  nameEn: 'SIMAT Discovery Set (5 × 2ml)',
  categoryId: 'cat_discovery',
  description:
    'جرب 5 من أكتر عطورنا المحبوبة على جلدك في البيت قبل ما تقرر.',
  descriptionEn:
    'Try five of our most loved perfumes at home on your own skin before you decide.',
  family: 'طقم عينات',
  familyEn: 'Discovery Coffret',
  kind: 'set',
  labelStyle: 'noir',
  secondaryLine: '5 × 2ml',
  tagline: 'Try before you decide.',
  taglineAr: 'جرب قبل ما تقرر.',
  shortDescription: 'Five 2ml vials of our best sellers.',
  shortDescriptionAr: '5 عينات 2 مل من أكتر عطورنا مبيعاً.',
  scentCharacter: '',
  scentCharacterAr: '',
  accords: [],
  accordsAr: [],
  wearProfile: '',
  wearProfileAr: '',
  occasion: '',
  occasionAr: '',
  related: [],
  // لسه ملهوش سعر من العميل — بيظهر «السعر قريباً» ومينفعش يتطلب.
  variants: [],
  price: 0,
  sizeMl: 10,
  gender: 'unisex',
  concentration: 'edp',
  topNotes: ['NOCTURNE', 'IMPRINT', 'CLARITY', 'INSTINCT', 'SOMA'],
  heartNotes: [],
  baseNotes: [],
  topNotesEn: ['NOCTURNE', 'IMPRINT', 'CLARITY', 'INSTINCT', 'SOMA'],
  heartNotesEn: [],
  baseNotesEn: [],
  longevityHours: 8,
  stock: 120,
  soldCount: 50,
  isFeatured: false,
  createdAt: daysAgo(90),
};

export const products: Product[] = [...sheetProducts, discoverySet];

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
