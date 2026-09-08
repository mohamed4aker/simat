// ثوابت المتجر: معلومات التواصل، الشحن، والمحافظات.

export const STORE = {
  name: 'SIMAT',
  nameAr: 'سِمة',
  tagline: 'عطور تُخلّد الأثر',
  description:
    'سِمة — عطور فاخرة بخامات أصلية وتركيبات مصرية. عود، ورد طائفي، '
    + 'عنبر، ومسك. شحن لكل محافظات مصر والدفع عند الاستلام.',
  phone: '01000000000',
  whatsapp: '201000000000',
  email: 'care@simat.store',
  instagram: 'simat.perfumes',
  facebook: 'simat.perfumes',
  address: 'القاهرة، مصر',
  currency: 'ج.م',
} as const;

/** الطلبات فوق المبلغ ده شحنها مجاني. */
export const FREE_SHIPPING_THRESHOLD = 1500;

/** تكلفة الشحن بالجنيه لكل محافظة. */
export const SHIPPING_RATES: Record<string, number> = {
  'القاهرة': 50,
  'الجيزة': 50,
  'القليوبية': 55,
  'الإسكندرية': 65,
  'الدقهلية': 70,
  'الشرقية': 70,
  'الغربية': 70,
  'المنوفية': 70,
  'البحيرة': 75,
  'كفر الشيخ': 75,
  'دمياط': 75,
  'بورسعيد': 75,
  'الإسماعيلية': 75,
  'السويس': 75,
  'الفيوم': 80,
  'بني سويف': 80,
  'المنيا': 85,
  'أسيوط': 90,
  'سوهاج': 95,
  'قنا': 100,
  'الأقصر': 105,
  'أسوان': 110,
  'البحر الأحمر': 120,
  'مطروح': 120,
  'شمال سيناء': 130,
  'جنوب سيناء': 130,
  'الوادي الجديد': 130,
};

export const GOVERNORATES = Object.keys(SHIPPING_RATES);

export function shippingFor(governorate: string, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_RATES[governorate] ?? 80;
}

export const DELIVERY_DAYS = { min: 2, max: 5 } as const;

/** عنوان الموقع — يُستخدم في روابط SEO وخريطة الموقع. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://simat.store';
