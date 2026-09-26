import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { fill, getDictionary, hasLocale, locales } from '@/i18n';
import { to } from '@/lib/href';
import { price, priceNumber } from '@/lib/format';
import { productText, shortName } from '@/lib/localize';
import { FREE_SHIPPING_THRESHOLD, SITE_URL } from '@/lib/constants';
import { getProductBySlug, getProducts, getRelated } from '@/lib/store';
import { Coffret, Flacon } from '@/components/brand/Flacon';
import { BuyBox } from '@/components/product/BuyBox';
import { ProductCard } from '@/components/product/ProductCard';
import { Faq } from '@/components/home/Faq';

// الصفحة بتتحدّث كل دقيقة، فأي تعديل من لوحة التحكم بيظهر بسرعة.
export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return locales.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/product/[slug]'>): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const text = productText(product, lang);
  const description = text.description.slice(0, 155);
  return {
    title: text.name,
    description,
    alternates: {
      canonical: `/${lang}/product/${slug}`,
      languages: { ar: `/ar/product/${slug}`, en: `/en/product/${slug}` },
    },
    openGraph: { type: 'website', title: text.name, description, url: `${SITE_URL}/${lang}/product/${slug}` },
  };
}

export default async function ProductPage({ params }: PageProps<'/[lang]/product/[slug]'>) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const dict = getDictionary(lang);
  const t = dict.product;
  const text = productText(product, lang);
  const [related, all] = await Promise.all([getRelated(product, 3), getProducts()]);
  const discoverySet = all.find((p) => p.kind === 'set') ?? null;
  const isSet = product.kind === 'set';
  const joiner = lang === 'ar' ? '، ' : ', ';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: text.name,
    description: text.description,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'SIMAT' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/${lang}/product/${product.slug}`,
      priceCurrency: 'EGP',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  const noteRows = [
    [t.topNotes, text.top],
    [t.heartNotes, text.heart],
    [t.baseNotes, text.base],
  ] as const;

  return (
    <div className="py-14 px-6 max-w-7xl mx-auto">
      <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-wider text-stone-500 mb-8 flex items-center gap-2">
        <Link href={to(lang)} className="hover:text-bordeaux">{dict.common.home}</Link>
        <span>/</span>
        <Link href={to(lang, '/shop')} className="hover:text-bordeaux">{t.crumbShop}</Link>
        <span>/</span>
        <span className="text-bordeaux font-medium truncate">{text.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* المعرض */}
        <div className="lg:col-span-6 lg:sticky lg:top-32">
          <div className="relative aspect-[4/5] bg-gradient-to-b from-[#f2ece1] via-[#ece5d9] to-[#dfd6c7] border border-linen-border p-8 flex flex-col items-center justify-between shadow-xl overflow-hidden">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-serif self-start">
              {isSet ? '5 × 2 ML' : t.flaconLabel}
            </span>
            <div className="my-auto">
              {isSet ? (
                <Coffret size="lg" />
              ) : (
                <Flacon
                  labelStyle={product.labelStyle}
                  name={shortName(product)}
                  concentration={dict.concentration[product.concentration]}
                  size="lg"
                  imageUrl={product.imageUrl}
                  alt={text.name}
                />
              )}
            </div>
            <span className="latin text-[10px] tracking-wider uppercase text-stone-500 self-end">
              {isSet ? 'Discovery Coffret' : `${product.sizeMl} ML · 3.4 FL. OZ.`}
            </span>
          </div>
        </div>

        {/* التفاصيل */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-bordeaux font-serif block mb-1">
              {isSet ? text.family : `${dict.concentration[product.concentration]} · ${product.sizeMl} ML`}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-noir">{text.name}</h1>
            <div className="flex flex-wrap items-baseline gap-3 mt-2">
              <span className="latin text-2xl text-noir tracking-wide">{price(product.price, lang)}</span>
              <span className="text-xs text-stone-500">
                {fill(t.freeShipping, { amount: priceNumber(FREE_SHIPPING_THRESHOLD) })}
              </span>
            </div>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed">{text.description}</p>

          <div className="border-y border-linen-border py-4 space-y-3 text-xs">
            {isSet ? (
              <div>
                <span className="text-[11px] uppercase tracking-wider text-bordeaux font-medium block">{t.setIncludes}</span>
                <ul className="mt-2 grid grid-cols-2 gap-1.5 text-stone-800 font-serif">
                  {text.top.map((n) => (
                    <li key={n} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gold" /> {n} · 2 {dict.common.ml}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                {noteRows
                  .filter(([, notes]) => notes.length > 0)
                  .map(([label, notes]) => (
                    <div key={label}>
                      <span className="text-[11px] uppercase tracking-wider text-bordeaux font-medium block">{label}</span>
                      <p className="text-stone-800 font-serif mt-0.5 text-sm">{notes.join(joiner)}</p>
                    </div>
                  ))}
                <p className="text-[11px] text-stone-500 pt-1">{fill(t.longevity, { hours: product.longevityHours })}</p>
              </>
            )}
          </div>

          <BuyBox product={product} discoverySet={discoverySet} />

          <div className="space-y-2 pt-4">
            {[
              [t.acc1Title, t.acc1Body],
              [t.acc2Title, t.acc2Body],
            ].map(([title, body]) => (
              <details key={title} className="group border border-linen-border bg-linen p-3.5">
                <summary className="flex justify-between items-center text-xs font-serif text-noir cursor-pointer">
                  <span>{title}</span>
                  <ChevronDown className="chevron w-4 h-4 transition-transform" strokeWidth={1.5} />
                </summary>
                <p className="text-[11px] text-stone-700 mt-2 leading-relaxed">{body}</p>
              </details>
            ))}
          </div>

          <div className="pt-6 border-t border-linen-border">
            <Faq lang={lang} variant="compact" />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 pt-12 border-t border-linen-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-bordeaux font-serif block mb-1">{t.recoEyebrow}</span>
              <h2 className="text-2xl font-serif text-noir">{t.recoTitle}</h2>
            </div>
            <Link href={to(lang, '/shop')} className="text-xs uppercase tracking-wider text-bordeaux hover:underline font-medium">
              {t.recoAll}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  );
}
