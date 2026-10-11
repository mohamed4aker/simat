/**
 * أحجام الزجاجات والأسعار. أسعار كل عطر جاية من الشيت
 * (scripts/import-catalog.py) أو من لوحة التحكم — مفيش أسعار افتراضية.
 * منتج من غير سعر (0) بيظهر «السعر قريباً» ومينفعش يتطلب.
 */
import type { Product, Variant } from './types';

export const SIZE_OPTIONS = [40, 60, 100] as const;

/** الحجم اللي بيكون مختار أول ما صفحة المنتج تفتح. */
export const DEFAULT_SIZE = 60;

/** الأحجام المتاحة للمنتج (مترتبة من الصغير للكبير). */
export function variantsOf(p: Pick<Product, 'variants' | 'price' | 'sizeMl'>): Variant[] {
  if (p.variants?.length) return [...p.variants].sort((a, b) => a.sizeMl - b.sizeMl);
  return [{ sizeMl: p.sizeMl, price: p.price }];
}

/** الحجم الافتراضي للمنتج (60 لو موجود، وإلا أول حجم). */
export function defaultVariant(p: Pick<Product, 'variants' | 'price' | 'sizeMl'>): Variant {
  const list = variantsOf(p);
  return list.find((v) => v.sizeMl === DEFAULT_SIZE) ?? list[0];
}

export function priceFor(
  p: Pick<Product, 'variants' | 'price' | 'sizeMl'>,
  sizeMl?: number,
): number {
  const list = variantsOf(p);
  return (list.find((v) => v.sizeMl === sizeMl) ?? defaultVariant(p)).price;
}

/** أقل سعر — للكروت: «من 450 ج.م». */
export function minPrice(p: Pick<Product, 'variants' | 'price' | 'sizeMl'>): number {
  return Math.min(...variantsOf(p).map((v) => v.price));
}

/** المنتج ليه سعر ويتطلب؟ */
export function hasPrice(p: Pick<Product, 'variants' | 'price' | 'sizeMl'>): boolean {
  return variantsOf(p).some((v) => v.price > 0);
}
