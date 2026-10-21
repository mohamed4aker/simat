import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/i18n';
import { to } from '@/lib/href';
import { getProducts } from '@/lib/store';
import { homeSlides } from '@/lib/home-slides';
import { HeroSlider } from '@/components/home/HeroSlider';
import { BestSellers } from '@/components/home/BestSellers';
import { Testimonials } from '@/components/home/Testimonials';
import { Faq } from '@/components/home/Faq';
import { Eyebrow, SectionTitle, btn } from '@/components/ui/store';
import { cardProduct } from '@/lib/slim';

export const revalidate = 60;

/**
 * الصفحة الرئيسية — بسيطة ومركّزة:
 *   سلايدر · تسوق حسب الفئة · الأكثر مبيعاً · قصتنا · آراء العملاء · الأسئلة الشائعة
 */
export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const products = await getProducts();
  const bottles = products.filter((p) => p.kind === 'bottle');
  const bestSellers = [...bottles].sort((a, b) => b.soldCount - a.soldCount);

  // صور الفئات من صور المكونات بتاعة عطر من كل فئة.
  const categories = [
    { key: 'women', href: '/shop?gender=women', image: '/products/anima-notes.webp' },
    { key: 'men', href: '/shop?gender=men', image: '/products/legacy-notes.webp' },
    { key: 'unisex', href: '/shop?gender=unisex', image: '/products/comfort-notes.webp' },
  ] as const;

  return (
    <div className="space-y-20 md:space-y-28">
      {/* ── 01 · السلايدر ─────────────────────────────────────── */}
      <HeroSlider slides={homeSlides} />

      {/* ── 02 · تسوق حسب الفئة ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <SectionTitle center eyebrow={dict.categories.eyebrow} title={dict.categories.title} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {categories.map((c) => {
            const t = dict.categories[c.key];
            return (
              <Link
                key={c.key}
                href={to(lang, c.href)}
                className="group relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-bordeaux-deep"
              >
                <Image
                  src={c.image}
                  alt={t.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bordeaux-deep/90 via-bordeaux-dark/30 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 text-center">
                  <h3 className="text-2xl font-serif text-linen-light">{t.title}</h3>
                  <span className="mt-3 inline-block border border-linen-light/70 text-linen-light px-5 py-2 text-[11px] tracking-wider uppercase group-hover:bg-linen-light group-hover:text-bordeaux transition-colors">
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
            <Image
              src="/products/aureate-notes.webp"
              alt={dict.story.eyebrow}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-5">
            <Eyebrow>{dict.story.eyebrow}</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-serif text-noir leading-snug">{dict.story.quote}</h2>
            <p className="text-sm text-stone-700 leading-relaxed">{dict.story.body}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600 font-medium">
              <span>{dict.story.point1}</span>
              <span aria-hidden="true" className="text-gold">•</span>
              <span>{dict.story.point2}</span>
              <span aria-hidden="true" className="text-gold">•</span>
              <span>{dict.story.point3}</span>
            </div>
            <Link href={to(lang, '/about')} className={`${btn.primary} inline-flex`}>{dict.story.more}</Link>
          </div>
        </div>
      </section>

      {/* ── 05 · آراء العملاء (بتظهر لما يبقى فيه آراء حقيقية) ── */}
      <Testimonials lang={lang} />

      {/* ── 06 · الأسئلة الشائعة ──────────────────────────────── */}
      <Faq lang={lang} />
    </div>
  );
}
