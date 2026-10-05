/**
 * أحجام الزجاجات والأسعار.
 *
 * ⚠ الأسعار دي مؤقتة لحد ما تتعتمد. لما تتحدد غيّرها هنا وشغّل
 * `npm run gen:seed` (أو عدّلها من لوحة التحكم لكل عطر لوحده).
 */
import type { Product, Variant } from './types';

export const SIZE_OPTIONS = [40, 60, 100] as const;

/** الحجم اللي بيكون مختار أول ما صفحة المنتج تفتح. */
export const DEFAULT_SIZE = 60;

export const DEFAULT_PRICES: Record<number, number> = {
  40: 450,
  60: 600,
  100: 850,
};

export const defaultVariants = (): Variant[] =>
  SIZE_OPTIONS.map((sizeMl) => ({ sizeMl, price: DEFAULT_PRICES[sizeMl] }));

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
