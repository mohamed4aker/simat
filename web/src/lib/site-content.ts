/**
 * محتوى الموقع اللي بيتعدل من لوحة التحكم ← «تصميم الموقع»:
 * السلايدر، صور الفئات، شريط الإعلان، قصتنا، الأسئلة الشائعة،
 * «زورنا في المحل»، وبيانات التواصل.
 *
 * بيتحفظ في جدول settings (المفتاح site_content) كـ JSON. أي حاجة
 * مش متحفظة بتاخد القيمة الافتراضية من هنا (نفس اللي على الموقع
 * دلوقتي)، فالموقع عمره ما يطلع فاضي.
 *
 * الملف ده مشترك بين السيرفر والمتصفح (لوحة التحكم).
 */
import { getDictionary } from '@/i18n';
import { STORE, STORE_VISIT } from './constants';
import { homeSlides, type HomeSlide } from './home-slides';

export type Bi = { ar: string; en: string };

export type CategoryKey = 'women' | 'men' | 'unisex';

export interface SiteContact {
  /** رقم التليفون زي ما بيتكتب في الاتصال (01273162855). */
  phone: string;
  /** شكل الرقم اللي بيظهر للناس (+20 12 73162855). */
  phoneDisplay: string;
  /** رقم الواتساب بالكود الدولي من غير + (201273162855). */
  whatsapp: string;
  email: string;
  instagram: string;
  tiktok: string;
  facebookUrl: string;
}

export interface FaqItem {
  topic: Bi;
  q: Bi;
  a: Bi;
}

export interface SiteContent {
  /** جملة شريط الإعلان — {amount} = حد الشحن المجاني. */
  announcement: Bi;
  slides: HomeSlide[];
  categories: Record<CategoryKey, { image: string; title: Bi }>;
  story: {
    image: string;
    eyebrow: Bi;
    quote: Bi;
    body: Bi;
    points: [Bi, Bi, Bi];
  };
  faq: FaqItem[];
  visit: {
    show: boolean;
    image: string;
    mapsUrl: string;
    address: Bi;
    eyebrow: Bi;
    title: Bi;
    body: Bi;
    badge: Bi;
  };
  contact: SiteContact;
}

export const SITE_CONTENT_KEY = 'site_content';

const ar = getDictionary('ar');
const en = getDictionary('en');
const bi = (a: string, e: string): Bi => ({ ar: a, en: e });

export const CATEGORY_KEYS: CategoryKey[] = ['women', 'men', 'unisex'];

/** المحتوى الحالي للموقع — بيتعرض لحد ما الأدمن يغيّره. */
export function defaultSiteContent(): SiteContent {
  return {
    announcement: bi(ar.announcement.delivery, en.announcement.delivery),
    slides: homeSlides.map((s) => structuredClone(s)),
    categories: {
      women: { image: '/products/anima-notes.webp', title: bi(ar.categories.women.title, en.categories.women.title) },
      men: { image: '/products/legacy-notes.webp', title: bi(ar.categories.men.title, en.categories.men.title) },
      unisex: { image: '/products/comfort-notes.webp', title: bi(ar.categories.unisex.title, en.categories.unisex.title) },
    },
    story: {
      image: '/products/aureate-notes.webp',
      eyebrow: bi(ar.story.eyebrow, en.story.eyebrow),
      quote: bi(ar.story.quote, en.story.quote),
      body: bi(ar.story.body, en.story.body),
      points: [
        bi(ar.story.point1, en.story.point1),
        bi(ar.story.point2, en.story.point2),
        bi(ar.story.point3, en.story.point3),
      ],
    },
    faq: ar.faq.items.map((item, i) => ({
      topic: bi(item.topic, en.faq.items[i]?.topic ?? ''),
      q: bi(item.q, en.faq.items[i]?.q ?? ''),
      a: bi(item.a, en.faq.items[i]?.a ?? ''),
    })),
    visit: {
      show: Boolean(STORE_VISIT.mapsUrl),
      image: STORE_VISIT.image,
      mapsUrl: STORE_VISIT.mapsUrl,
      address: bi(STORE_VISIT.addressAr, STORE_VISIT.addressEn),
      eyebrow: bi(ar.visit.eyebrow, en.visit.eyebrow),
      title: bi(ar.visit.title, en.visit.title),
      body: bi(ar.visit.body, en.visit.body),
      badge: bi(ar.visit.badge, en.visit.badge),
    },
    contact: {
      phone: STORE.phone,
      phoneDisplay: STORE.phoneDisplay,
      whatsapp: STORE.whatsapp,
      email: STORE.email,
      instagram: STORE.instagram,
      tiktok: STORE.tiktok,
      facebookUrl: STORE.facebookUrl,
    },
  };
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * بيحط المحفوظ فوق الافتراضي: الخانات اللي اتحفظت بتكسب، والناقصة
 * (أو اللي نوعها غلط) بتفضل زي ما هي. القوايم (السلايدات والأسئلة)
 * بتتاخد زي ما اتحفظت.
 */
function merge<T>(base: T, saved: unknown): T {
  if (saved === undefined || saved === null) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(saved)) return base;
    // points ليها عدد ثابت — باقي القوايم بتتاخد كلها.
    if (base.length === 3 && saved.length === 3 && base.every((b) => isObj(b) && 'ar' in b)) {
      return base.map((b, i) => merge(b, saved[i])) as T;
    }
    return saved as T;
  }
  if (isObj(base)) {
    if (!isObj(saved)) return base;
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) out[key] = merge((base as Record<string, unknown>)[key], saved[key]);
    return out as T;
  }
  return typeof saved === typeof base ? (saved as T) : base;
}

export function parseSiteContent(raw: string | null | undefined): SiteContent {
  const base = defaultSiteContent();
  if (!raw) return base;
  try {
    return merge(base, JSON.parse(raw));
  } catch {
    return base;
  }
}

/** النص باللغة المطلوبة، ولو فاضي بيرجع للغة التانية. */
export const pick = (t: Bi, lang: string) =>
  (lang === 'en' ? t.en || t.ar : t.ar || t.en) ?? '';

export const whatsappHref = (c: Pick<SiteContact, 'whatsapp'>, text = '') =>
  `https://wa.me/${c.whatsapp.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

// ── الشحن ────────────────────────────────────────────────────

export interface ShippingConfig {
  freeThreshold: number;
  rates: Record<string, number>;
}

/** نفس حساب create_order في قاعدة البيانات بالظبط (عشان اللي يظهر = اللي يتحسب). */
export function shippingCost(config: ShippingConfig, governorate: string, subtotal: number): number {
  if (subtotal >= config.freeThreshold) return 0;
  return config.rates[governorate] ?? 80;
}
