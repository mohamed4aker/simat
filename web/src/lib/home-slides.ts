/**
 * سلايدات أول الصفحة الرئيسية. كل سلايد ليه صورة ورسالة ولينك مختلف
 * (فئة، منتج، عرض…).
 *
 * بانر بعرض الصفحة: حط `banner` (الكلام بيبقى مكتوب جوه البانر، والموقع
 * بيحط زرار SHOP NOW تحت):
 *   desktop — 1920 × 800   ·   mobile — 1080 × 1350
 *   مثال: banner: { desktop: '/banners/slide-1.webp', mobile: '/banners/slide-1-m.webp' }
 * من غير `banner` السلايد بيظهر بالشكل المتقسّم: صورة مربعة (1600 × 1600)
 * والكلام جنبها.
 */
export type HomeSlide = {
  banner?: { desktop: string; mobile: string };
  image: string;
  href: string;
  eyebrow: { ar: string; en: string };
  title: { ar: string; en: string };
  body: { ar: string; en: string };
};

export const homeSlides: HomeSlide[] = [
  {
    image: '/products/nocturne-notes.webp',
    href: '/shop?gender=women',
    eyebrow: { ar: 'FOR HER · عطور حريمي', en: 'FOR HER' },
    title: { ar: 'أنوثة بتفضل معاكي طول اليوم', en: 'Femininity that stays with you all day' },
    body: {
      ar: 'من الفانيلا الدافية للزهور الناعمة — اختاري العطر اللي يشبهك.',
      en: 'From warm vanilla to soft florals — choose the scent that feels like you.',
    },
  },
  {
    image: '/products/instinct-notes.webp',
    href: '/shop?gender=men',
    eyebrow: { ar: 'FOR HIM · عطور رجالي', en: 'FOR HIM' },
    title: { ar: 'حضور واثق من أول رشة', en: 'Confident presence from the first spray' },
    body: {
      ar: 'أخشاب وعود وانتعاش — عطور رجالي بثبات حقيقي.',
      en: 'Woods, oud and freshness — men’s perfumes with real longevity.',
    },
  },
  {
    image: '/products/imprint-notes.webp',
    href: '/product/imprint',
    eyebrow: { ar: 'الأكثر طلباً', en: 'BEST SELLER' },
    title: { ar: 'IMPRINT — بصمة ما بتتنسيش', en: 'IMPRINT — an unforgettable signature' },
    body: { ar: 'مستوحى من Baccarat Rouge 540', en: 'Inspired by Baccarat Rouge 540' },
  },
  {
    image: '/products/soma-notes.webp',
    href: '/shop?gender=unisex',
    eyebrow: { ar: 'UNISEX · للجنسين', en: 'UNISEX' },
    title: { ar: 'عطور دافية تناسب الكل', en: 'Warm scents made for everyone' },
    body: {
      ar: 'عنبر وتوابل وحلاوة شرقية — للجنسين.',
      en: 'Amber, spices and oriental sweetness — for everyone.',
    },
  },
];
