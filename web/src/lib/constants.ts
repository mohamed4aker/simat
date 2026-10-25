// ثوابت المتجر: معلومات التواصل، الشحن، والمحافظات.

// رقم سِمة (واتساب وتليفون) وحسابات السوشيال من العميلة. الإيميل لسه مؤقت.
export const STORE = {
  name: 'SIMAT',
  nameAr: 'سِمة',
  phone: '01273162855',
  phoneDisplay: '+20 12 73162855',
  whatsapp: '201273162855',
  email: 'care@simat.store',
  // حسابات السوشيال (من العميلة)
  instagram: 'simatt_eg',
  tiktok: 'simatt.eg',
  facebookUrl: 'https://www.facebook.com/share/1DVxtVSNKU/',
  currency: 'ج.م',
} as const;

/**
 * قسم «زورنا في المحل» (فوق الفوتر في الصفحة الرئيسية).
 * بيظهر لما لينك Google Maps يتحط هنا (سطر العنوان بيظهر لو اتكتب).
 *   mapsUrl: من Google Maps ← Share ← Copy link
 *   image:   صورة المحل في public/brand/ (مثلاً '/brand/store.webp')
 */
export const STORE_VISIT = {
  addressAr: '',
  addressEn: '',
  mapsUrl: 'https://maps.google.com/?q=31.244717,29.996843',
  image: '/brand/store.webp',
};

/** مطوّر الموقع والأبلكيشن — بيظهر في آخر الفوتر (الرقم بيفتح واتساب). */
export const DEVELOPER = {
  nameAr: 'م. محمد أحمد شاكر',
  nameEn: 'Eng. Mohamed Ahmed Shaker',
  email: 'mohamedshaker123654@gmail.com',
  phone: '01068287355',
} as const;

export const whatsappLink = (text = '') =>
  `https://wa.me/${STORE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

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

/** أسماء المحافظات بالإنجليزي — القيمة المتخزنة في الطلب بتفضل عربي. */
export const GOVERNORATE_EN: Record<string, string> = {
  'القاهرة': 'Cairo',
  'الجيزة': 'Giza',
  'القليوبية': 'Qalyubia',
  'الإسكندرية': 'Alexandria',
  'الدقهلية': 'Dakahlia',
  'الشرقية': 'Sharqia',
  'الغربية': 'Gharbia',
  'المنوفية': 'Monufia',
  'البحيرة': 'Beheira',
  'كفر الشيخ': 'Kafr El Sheikh',
  'دمياط': 'Damietta',
  'بورسعيد': 'Port Said',
  'الإسماعيلية': 'Ismailia',
  'السويس': 'Suez',
  'الفيوم': 'Faiyum',
  'بني سويف': 'Beni Suef',
  'المنيا': 'Minya',
  'أسيوط': 'Asyut',
  'سوهاج': 'Sohag',
  'قنا': 'Qena',
  'الأقصر': 'Luxor',
  'أسوان': 'Aswan',
  'البحر الأحمر': 'Red Sea',
  'مطروح': 'Matrouh',
  'شمال سيناء': 'North Sinai',
  'جنوب سيناء': 'South Sinai',
  'الوادي الجديد': 'New Valley',
};

/** المحافظات اللي التوصيل ليها خلال ٢٤–٤٨ ساعة. */
export const FAST_DELIVERY = ['الإسكندرية', 'القاهرة', 'الجيزة'];

/** مناطق مقترحة في خانة «المنطقة» عشان الكتابة تبقى أسرع. */
export const AREA_SUGGESTIONS: Record<string, { ar: string; en: string }[]> = {
  'الإسكندرية': [
    { ar: 'المنتزه', en: 'Montazah' }, { ar: 'سموحة', en: 'Smouha' },
    { ar: 'كفر عبده', en: 'Kafr Abdo' }, { ar: 'رشدي', en: 'Roushdy' },
    { ar: 'سيدي جابر', en: 'Sidi Gaber' }, { ar: 'جليم', en: 'Gleem' },
    { ar: 'سان ستيفانو', en: 'San Stefano' }, { ar: 'محطة الرمل', en: 'Raml Station' },
    { ar: 'العجمي', en: 'Agami' },
  ],
  'القاهرة': [
    { ar: 'التجمع الخامس', en: '5th Settlement' }, { ar: 'الزمالك', en: 'Zamalek' },
    { ar: 'المعادي', en: 'Maadi' }, { ar: 'مصر الجديدة', en: 'Heliopolis' },
    { ar: 'مدينة نصر', en: 'Nasr City' }, { ar: 'وسط البلد', en: 'Downtown' },
    { ar: 'الرحاب', en: 'Rehab' }, { ar: 'مدينتي', en: 'Madinaty' },
  ],
  'الجيزة': [
    { ar: 'الشيخ زايد', en: 'Sheikh Zayed' }, { ar: '٦ أكتوبر', en: '6th of October' },
    { ar: 'الدقي', en: 'Dokki' }, { ar: 'المهندسين', en: 'Mohandessin' },
    { ar: 'الهرم', en: 'Haram' }, { ar: 'فيصل', en: 'Faisal' },
  ],
};

export function shippingFor(governorate: string, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_RATES[governorate] ?? 80;
}

export const DELIVERY_DAYS = { min: 2, max: 4 } as const;

/** عنوان الموقع — يُستخدم في روابط SEO وخريطة الموقع. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://simatfragrances.com';
