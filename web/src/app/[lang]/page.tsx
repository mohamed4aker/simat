import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fill, getDictionary, hasLocale } from '@/i18n';
import { to } from '@/lib/href';
import { price, priceNumber } from '@/lib/format';
import { productText, shortName } from '@/lib/localize';
import { STORE } from '@/lib/constants';
import { getProducts } from '@/lib/store';
import { Coffret, Flacon } from '@/components/brand/Flacon';
import { BestSellers } from '@/components/home/BestSellers';
import { ScentFinder } from '@/components/home/ScentFinder';
import { Layering } from '@/components/home/Layering';
import { Newsletter } from '@/components/home/Newsletter';
import { Faq } from '@/components/home/Faq';
import { AddButton } from '@/components/home/AddButton';
import { NotesButton } from '@/components/home/NotesButton';
import { Eyebrow, SectionTitle, btn } from '@/components/ui/store';

export const revalidate = 60;

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const products = await getProducts();
  const bottles = products.filter((p) => p.kind === 'bottle');
  const signature = products.find((p) => p.slug === 'simat-bordeaux') ?? bottles[0];
  const discoverySet = products.find((p) => p.kind === 'set');
  const signatureText = signature ? productText(signature, lang) : null;
  const bestSellers = [...bottles].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);

  const categories = [
    { key: 'women', href: '/shop?gender=women', image: 'photo-1518709268805-4e9042af9f23' },
    { key: 'men', href: '/shop?gender=men', image: 'photo-1608571423902-eed4a5ad8108' },
    { key: 'unisex', href: '/shop?gender=unisex', image: 'photo-1509783236416-c9ad59bae472' },
    { key: 'discovery', href: '#discovery-set', image: 'photo-1594035910387-fea47794261f' },
  ] as const;

  const social = [
    'photo-1592945403244-b3fbafd7f539',
    'photo-1547887537-6158d64c35b3',
    'photo-1616949755610-8c9bbc08f138',
    'photo-1594035910387-fea47794261f',
  ];

  return (
    <div className="space-y-24 md:space-y-32">
      {/* ── 01 · Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-b from-[#f2ede4] via-linen-light to-[#ece5d9] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden="true">
          <div className="absolute top-1/4 end-1/4 w-[500px] h-[500px] bg-bordeaux/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 start-10 w-96 h-96 bg-gold/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          <div className="lg:col-span-6 flex flex-col items-start">
            <Eyebrow className="!tracking-[0.3em] mb-3">{dict.hero.eyebrow}</Eyebrow>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-noir tracking-tight leading-[1.15] mb-6 max-w-2xl">
              {dict.hero.title}
            </h1>
            <p className="text-sm md:text-base text-stone-700 max-w-xl leading-relaxed mb-10">{dict.hero.body}</p>
            <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full sm:w-auto">
              <Link href={to(lang, '/shop')} className={`${btn.primary} !px-10`}>{dict.hero.ctaPrimary}</Link>
              <Link href={to(lang, '#scent-finder')} className={`${btn.outline} !px-10`}>{dict.hero.ctaSecondary}</Link>
            </div>
            <div className="mt-14 flex items-center gap-2.5 text-[11px] text-stone-600">
              <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
              <span>{dict.hero.trust}</span>
            </div>
          </div>

          {signature && signatureText && (
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/5] bg-gradient-to-b from-[#f5efe6] via-[#ece5d9] to-[#dfd6c7] border border-linen-border shadow-2xl p-8 flex flex-col items-center justify-between">
                <div className="w-full flex items-center justify-between text-[11px] tracking-wider text-stone-600 font-serif">
                  <span>{dict.hero.cardAtelier}</span>
                  <span className="text-bordeaux font-medium"><bdi className="latin">100 ML</bdi> · {dict.concentrationShort[signature.concentration]}</span>
                </div>
                <Link href={to(lang, `/product/${signature.slug}`)} className="my-auto hover:scale-105 transition-transform duration-500" aria-label={signatureText.name}>
                  <Flacon
                    labelStyle={signature.labelStyle}
                    name={shortName(signature)}
                    concentration={dict.concentration[signature.concentration]}
                    size="lg"
                  />
                </Link>
                <div className="w-full pt-4 border-t border-stone-300/80 flex items-center justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <h3 className="font-serif text-sm text-noir">{signatureText.name}</h3>
                    <p className="text-[11px] text-stone-600 truncate">{signatureText.top.slice(0, 3).join(' · ')}</p>
                  </div>
                  <NotesButton product={signature} className="text-[11px] uppercase tracking-wider text-bordeaux hover:underline font-medium whitespace-nowrap">
                    {dict.hero.viewNotes}
                  </NotesButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 02 · الجودة والتركيبة ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <Eyebrow>{dict.quality.eyebrow}</Eyebrow>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-noir leading-tight">{dict.quality.title}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{dict.quality.body}</p>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-linen-border">
              <div>
                <span className="text-2xl font-serif text-noir block font-medium">{dict.quality.stat1Value}</span>
                <span className="text-[11px] uppercase tracking-wider text-stone-600">{dict.quality.stat1Label}</span>
              </div>
              <div>
                <span className="text-2xl font-serif text-noir block font-medium">{dict.quality.stat2Value}</span>
                <span className="text-[11px] uppercase tracking-wider text-stone-600">{dict.quality.stat2Label}</span>
              </div>
            </div>
            <Link href={to(lang, '/shop')} className={`${btn.link} block pt-2`}>{dict.quality.cta}</Link>
          </div>
          <div className="lg:col-span-6 aspect-[4/5] bg-stone-900 border border-linen-border overflow-hidden relative shadow-xl group">
            <Image
              src={img('photo-1592945403244-b3fbafd7f539', 1000)}
              alt={signatureText?.name ?? 'SIMAT'}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-transparent" />
            {signature && signatureText && (
              <div className="absolute bottom-6 inset-x-6 flex items-end justify-between gap-4 text-white">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-gold font-serif">{dict.quality.cardLabel}</span>
                  <h4 className="text-xl font-serif">{signatureText.name}</h4>
                  <p className="text-[11px] text-stone-300 mt-0.5">{signatureText.top.slice(0, 2).concat(signatureText.heart.slice(0, 1)).join('، ')}</p>
                </div>
                <Link href={to(lang, `/product/${signature.slug}`)} className="shrink-0 px-4 py-2 bg-bordeaux text-linen-light text-[10px] uppercase tracking-wider font-medium hover:bg-bordeaux-dark transition-colors">
                  {dict.quality.cardCta}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 03 · الأكثر طلباً ────────────────────────────────── */}
      <BestSellers products={bestSellers} />

      {/* ── 04 · التصنيفات ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <SectionTitle center eyebrow={dict.categories.eyebrow} title={dict.categories.title} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c) => {
            const t = dict.categories[c.key];
            return (
              <Link key={c.key} href={to(lang, c.href)} className="group relative aspect-[3/4] overflow-hidden border border-linen-border bg-noir">
                <Image
                  src={img(c.image)}
                  alt={t.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover opacity-75 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <span className="text-[10px] uppercase tracking-wider text-gold font-serif mb-1 block">{t.sub}</span>
                  <h3 className="text-xl font-serif text-linen-light group-hover:text-gold transition-colors">{t.title}</h3>
                  <p className="text-xs text-stone-300 mt-1">{t.body}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 05 · قصتنا ──────────────────────────────────────── */}
      <section id="story" className="bg-linen py-20 border-y border-linen-border">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 aspect-[4/5] bg-stone-300 border border-linen-border p-6 flex flex-col justify-between shadow-inner">
            <span className="text-[10px] uppercase tracking-wider text-bordeaux font-serif font-bold">{dict.story.cardLabel}</span>
            <div className="my-auto text-center space-y-2">
              <span className="text-4xl font-serif text-noir block">{dict.story.cardValue}</span>
              <span className="text-xs uppercase tracking-wider text-stone-600 block">{dict.story.cardCaption}</span>
            </div>
            <span className="text-[10px] tracking-wider text-stone-500 uppercase">{dict.story.cardStamp}</span>
          </div>
          <div className="md:col-span-7 space-y-6">
            <Eyebrow>{dict.story.eyebrow}</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-serif text-noir leading-snug">{dict.story.quote}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{dict.story.body}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs uppercase tracking-wider text-stone-600 font-medium">
              <span>{dict.story.point1}</span>
              <span aria-hidden="true">•</span>
              <span>{dict.story.point2}</span>
              <span aria-hidden="true">•</span>
              <span>{dict.story.point3}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 · طقم العينات ────────────────────────────────── */}
      {discoverySet && (
        <section id="discovery-set" className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-linen via-[#ede6db] to-linen border border-linen-border p-8 md:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-sm">
            <div className="lg:col-span-7 space-y-5">
              <Eyebrow>{dict.discovery.eyebrow}</Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-serif text-noir">{dict.discovery.title}</h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-xl">
                {fill(dict.discovery.body, { amount: priceNumber(discoverySet.price) })}
              </p>
              <div className="flex flex-wrap items-baseline gap-4 pt-2">
                <span className="latin text-2xl font-serif text-bordeaux font-medium">{price(discoverySet.price, lang)}</span>
                <span className="text-xs text-stone-500">{dict.discovery.priceNote}</span>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <AddButton product={discoverySet} className={btn.primary}>{dict.discovery.cta}</AddButton>
                <Link href={to(lang, `/product/${discoverySet.slug}`)} className={btn.link}>{dict.mega.collections.explore}</Link>
              </div>
            </div>
            <div className="lg:col-span-5 flex items-center justify-center">
              <Coffret size="lg" />
            </div>
          </div>
        </section>
      )}

      {/* ── 07 · اختار عطرك ─────────────────────────────────── */}
      <ScentFinder products={bottles} />

      {/* ── 08 · ميكس العطور ────────────────────────────────── */}
      <Layering products={bottles} />

      {/* ── 09 · المكونات ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-noir text-linen-light p-10 md:p-16 border border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Eyebrow tone="gold">{dict.ingredients.eyebrow}</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-serif text-linen-light">{dict.ingredients.title}</h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">{dict.ingredients.body}</p>
            <Link href={to(lang, '/shop')} className="text-xs uppercase tracking-wider text-gold hover:underline pt-2 block font-medium">
              {dict.ingredients.cta}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {dict.ingredients.items.map((i) => (
              <div key={i.name} className="p-4 bg-stone-900 border border-stone-800">
                <span className="text-gold font-serif text-base block mb-1">{i.name}</span>
                <p className="text-stone-400 text-[11px]">{i.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10 · إنستجرام ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <Eyebrow>{dict.social.eyebrow}</Eyebrow>
            <h3 className="latin text-xl font-serif text-noir">@{STORE.instagram}</h3>
          </div>
          <a href={`https://instagram.com/${STORE.instagram}`} target="_blank" rel="noopener noreferrer" className={btn.link}>
            {dict.social.link}
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {social.map((id, i) => (
            <a
              key={id}
              href={`https://instagram.com/${STORE.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-stone-200 overflow-hidden group relative border border-linen-border"
            >
              <Image
                src={img(id, 600)}
                alt={dict.social.tiles[i]}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute inset-0 bg-noir/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-serif tracking-wider text-center p-2">
                {dict.social.tiles[i]}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── 11 · الأسئلة الشائعة ────────────────────────────── */}
      <Faq lang={lang} />

      {/* ── 12 · النشرة البريدية ────────────────────────────── */}
      <Newsletter />
    </div>
  );
}
