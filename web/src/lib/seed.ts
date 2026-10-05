// كتالوج سِمة — 58 عطر من شيت المنتجات + طقم العينات.
// بيُستخدم في وضع العرض (من غير قاعدة بيانات)، وكمان بيتحوّل لـ SQL
// في supabase/seed.sql (npm run gen:seed) عشان يتزرع في قاعدة البيانات.

import { catalogRows } from './catalog.data.ts';
import { DEFAULT_PRICES, DEFAULT_SIZE, defaultVariants } from './pricing.ts';
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

/** عطور سِمة من شيت المنتجات (58 عطر). */
const sheetProducts: Product[] = catalogRows.map((r) => ({
  ...empty,
  id: r.id,
  slug: r.slug,
  // الأسماء والمحتوى إنجليزي في الشيت — النسخة العربية بتعرضهم لحد ما تتترجم.
  name: r.nameEn,
  nameEn: r.nameEn,
  categoryId: 'cat_signature',
  description: '',
  descriptionEn: r.descriptionEn,
  family: '',
  familyEn: r.familyEn,
  kind: 'bottle',
  labelStyle: r.labelStyle,
  secondaryLine: r.secondaryLine,
  tagline: r.tagline,
  shortDescription: r.shortDescription,
  scentCharacter: r.scentCharacter,
  accords: [...r.accords],
  wearProfile: r.wearProfile,
  occasion: r.occasion,
  related: [...r.related],
  variants: defaultVariants(),
  price: DEFAULT_PRICES[DEFAULT_SIZE],
  sizeMl: DEFAULT_SIZE,
  gender: r.gender,
  concentration: 'edp',
  topNotes: [],
  heartNotes: [],
  baseNotes: [],
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
    'جرب 5 من أكتر عطورنا المحبوبة على جلدك في البيت. ومع العلبة كارت خصم بقيمة 650 ج.م تخصمه من تمن أي زجاجة تطلبها بعدين.',
  descriptionEn:
    'Try five of our most loved perfumes at home on your own skin. Inside the box you will find a 650 EGP voucher you can deduct from any full bottle later.',
  family: 'طقم عينات',
  familyEn: 'Discovery Coffret',
  kind: 'set',
  labelStyle: 'noir',
  secondaryLine: '5 × 2ml',
  tagline: 'Try before you decide.',
  shortDescription: 'Five 2ml vials of our best sellers.',
  scentCharacter: '',
  accords: [],
  wearProfile: '',
  occasion: '',
  related: [],
  variants: [],
  price: 650,
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
