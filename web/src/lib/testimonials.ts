/**
 * آراء العملاء في الصفحة الرئيسية.
 * ⚠ حط هنا آراء حقيقية بس (من واتساب / انستجرام بإذن صاحبها) —
 * القسم مش بيظهر خالص طول ما القايمة فاضية.
 */
export type Testimonial = {
  name: string;
  /** العطر اللي اشتراه (slug) — اختياري */
  product?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: { ar: string; en?: string };
};

export const testimonials: Testimonial[] = [];
