import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/i18n';
import { to } from '@/lib/href';
import { getProducts } from '@/lib/store';
import { CATEGORY_KEYS, pick } from '@/lib/site-content';
import { getSiteContent } from '@/lib/site-content.server';
import { HeroSlider } from '@/components/home/HeroSlider';
import { BestSellers } from '@/components/home/BestSellers';
import { Testimonials } from '@/components/home/Testimonials';
import { Faq } from '@/components/home/Faq';
import { VisitStore } from '@/components/home/VisitStore';
import { Eyebrow, SectionTitle, btn } from '@/components/ui/store';
import { cardProduct } from '@/lib/slim';

export const revalidate = 60;

/**
 * الصفحة الرئيسية — بسيطة ومركّزة:
 *   سلايدر · تسوق حسب الفئة · الأكثر مبيعاً · قصتنا · آراء العملاء · الأسئلة الشائعة · زورنا في المحل
 */
export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const [products, content] = await Promise.all([getProducts(), getSiteContent()]);
  const story = content.story;
  // سلايد من غير أي صورة مبيظهرش.
  const slides = content.slides
    .map((s) => ({ ...s, image: s.image || s.banner?.desktop || '' }))
    .filter((s) => s.image);
  const bottles = products.filter((p) => p.kind === 'bottle');
  const bestSellers = [...bottles].sort((a, b) => b.soldCount - a.soldCount);

  // صور الفئات وأساميها من لوحة التحكم ← تصميم الموقع.
  const categories = CATEGORY_KEYS.map((key) => ({
    key,
    href: `/shop?gender=${key}`,
    image: content.categories[key].image,
    title: pick(content.categories[key].title, lang),
  }));

  return (
    <div className="space-y-20 md:space-y-28">
      {/* ── 01 · السلايدر ─────────────────────────────────────── */}
      {slides.length > 0 && <HeroSlider slides={slides} />}

      {/* ── 02 · تسوق حسب الفئة ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 md:mb-10">
          <SectionTitle center eyebrow={dict.categories.eyebrow} title={dict.categories.title} />
        </div>
        {/* التلاتة جنب بعض حتى على الموبايل */}
        <div className="grid grid-cols-3 gap-2 sm:gap-5">
          {categories.map((c) => {
            return (
              <Link
                key={c.key}
                href={to(lang, c.href)}
                className="group relative aspect-[3/4] overflow-hidden bg-bordeaux-deep"
              >
                {c.image && <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  unoptimized
                  sizes="33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-bordeaux-deep/90 via-bordeaux-dark/30 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-6 text-center">
                  <h3 className="text-[13px] leading-tight sm:text-2xl font-serif text-linen-light">{c.title}</h3>
                  <span className="hidden sm:inline-block mt-3 border border-linen-light/70 text-linen-light px-5 py-2 text-[11px] tracking-wider uppercase group-hover:bg-linen-light group-hover:text-bordeaux transition-colors">
                    {dict.categories.cta}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 03 · الأكثر مبيعاً ────────────────────────────────── */}
      <BestSellers products={bestSellers.map(cardProduct)} />

      {/* ── 04 · قصتنا ───────────────────────────────────────── */}
      <section id="story" className="bg-linen border-y border-linen-border">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative aspect-square overflow-hidden shadow-xl">
            {story.image && <Image
              src={story.image}
              alt={pick(story.eyebrow, lang)}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />}
          </div>
          <div className="space-y-5">
            <Eyebrow>{pick(story.eyebrow, lang)}</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-serif text-noir leading-snug">{pick(story.quote, lang)}</h2>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{pick(story.body, lang)}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600 font-medium">
              {story.points
                .map((p) => pick(p, lang))
                .filter(Boolean)
                .map((p, i) => (
                  <span key={i} className="flex items-center gap-x-5">
                    {i > 0 && <span aria-hidden="true" className="text-gold">•</span>}
                    <span>{p}</span>
                  </span>
                ))}
            </div>
            <Link href={to(lang, '/about')} className={`${btn.primary} inline-flex`}>{dict.story.more}</Link>
          </div>
        </div>
      </section>

      {/* ── 05 · آراء العملاء (بتظهر لما يبقى فيه آراء حقيقية) ── */}
      <Testimonials lang={lang} />

      {/* ── 06 · الأسئلة الشائعة ──────────────────────────────── */}
      <Faq lang={lang} />

      {/* ── 07 · زورنا في المحل (بيظهر لما العنوان واللينك يتحطوا) ── */}
      <VisitStore lang={lang} />
    </div>
  );
}
