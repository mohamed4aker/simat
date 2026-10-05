import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lock, Plus, RotateCcw, Truck } from 'lucide-react';
import { fill, getDictionary, hasLocale, locales } from '@/i18n';
import { to } from '@/lib/href';
import { price } from '@/lib/format';
import { displayName, productText, shortName, subLine } from '@/lib/localize';
import { defaultVariant, variantsOf } from '@/lib/pricing';
import { SITE_URL } from '@/lib/constants';
import { getProductBySlug, getProducts, getProductsBySlugs, getRelated } from '@/lib/store';
import { Coffret, Flacon } from '@/components/brand/Flacon';
import { BuyBox } from '@/components/product/BuyBox';
import { AddBothButton } from '@/components/product/AddBothButton';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductImage } from '@/components/product/ProductImage';

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
  const dict = getDictionary(lang);
  const title = displayName(product, lang, dict.concentration);
  const description = (product.shortDescription || productText(product, lang).description).slice(0, 155);
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/product/${slug}`,
      languages: { ar: `/ar/product/${slug}`, en: `/en/product/${slug}` },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_URL}/${lang}/product/${slug}`,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

/** قسم بيتفتح ويتقفل بعلامة + */
function Accordion({
  title,
  children,
  open = false,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details className="group border-b border-linen-border" open={open}>
      <summary className="flex justify-between items-center py-4 cursor-pointer text-sm uppercase tracking-wider font-medium text-noir hover:text-bordeaux">
        <span>{title}</span>
        <Plus className="plus-icon w-4 h-4 transition-transform duration-300" strokeWidth={1.5} />
      </summary>
      <div className="pb-5 text-sm text-stone-700 leading-relaxed">{children}</div>
    </details>
  );
}

export default async function ProductPage({ params }: PageProps<'/[lang]/product/[slug]'>) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const dict = getDictionary(lang);
  const t = dict.product;
  const text = productText(product, lang);
  const title = displayName(product, lang, dict.concentration);
  const isSet = product.kind === 'set';
  const [layerWith, related] = await Promise.all([
    getProductsBySlugs(product.related),
    getRelated(product, 4),
  ]);
  const others = related.filter((p) => !product.related.includes(p.slug)).slice(0, 3);
  const joiner = lang === 'ar' ? '، ' : ', ';

  const specs = [
    [t.specScent, product.familyEn],
    [t.specCharacter, product.scentCharacter],
    [t.specBestFor, product.occasion],
  ].filter(([, v]) => v);

  const noteRows = [
    [t.topNotes, text.top],
    [t.heartNotes, text.heart],
    [t.baseNotes, text.base],
  ] as const;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: product.shortDescription || text.description,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'SIMAT' },
    image: product.imageUrl ?? undefined,
    offers: variantsOf(product).map((v) => ({
      '@type': 'Offer',
      url: `${SITE_URL}/${lang}/product/${product.slug}`,
      priceCurrency: 'EGP',
      price: v.price,
      name: `${v.sizeMl} ml`,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    })),
  };

  return (
    <div className="py-10 md:py-14 px-6 max-w-7xl mx-auto">
      <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-wider text-stone-500 mb-8 flex items-center gap-2">
        <Link href={to(lang)} className="hover:text-bordeaux">{dict.common.home}</Link>
        <span>/</span>
        <Link href={to(lang, '/shop')} className="hover:text-bordeaux">{t.crumbShop}</Link>
        <span>/</span>
        <span className="text-bordeaux font-medium truncate">{shortName(product)}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* الصور */}
        <div className="lg:col-span-6 lg:sticky lg:top-32 space-y-3">
          <div className="relative aspect-[4/5] bg-gradient-to-b from-[#f2ece1] via-[#ece5d9] to-[#dfd6c7] border border-linen-border flex items-center justify-center shadow-xl overflow-hidden">
            {product.imageUrl ? (
              <ProductImage src={product.imageUrl} alt={title} priority />
            ) : isSet ? (
              <Coffret size="lg" />
            ) : (
              <Flacon
                labelStyle={product.labelStyle}
                name={shortName(product)}
                concentration={dict.concentration[product.concentration]}
                size="lg"
              />
            )}
          </div>
          {product.hoverImageUrl && (
            <div className="relative aspect-[4/5] border border-linen-border overflow-hidden">
              <ProductImage src={product.hoverImageUrl} alt={title} />
            </div>
          )}
        </div>

        {/* التفاصيل — بنفس ترتيب المواصفات */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-noir leading-tight">{title}</h1>
            <p className="mt-2 text-xs sm:text-sm text-stone-500 tracking-wide">
              {subLine(product, lang, dict.genderTag, t.inspiredBy)}
            </p>
          </div>

          {specs.length > 0 && (
            <dl className="space-y-1.5 text-sm">
              {specs.map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <dt className="text-bordeaux font-medium shrink-0">{label}:</dt>
                  <dd className="text-stone-700">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <BuyBox product={product} />

          <ul className="bg-stone-100 border border-linen-border p-4 space-y-2.5 text-xs text-stone-700">
            <li className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-bordeaux shrink-0" strokeWidth={1.5} /> {t.trustShipping}
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-bordeaux shrink-0" strokeWidth={1.5} /> {t.trustReturns}
            </li>
            <li className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-bordeaux shrink-0" strokeWidth={1.5} /> {t.trustPayment}
            </li>
          </ul>

          <div className="border-t border-linen-border">
            {isSet ? (
              <Accordion title={t.setIncludes} open>
                <ul className="grid grid-cols-2 gap-1.5 font-serif">
                  {text.top.map((n) => (
                    <li key={n} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gold" /> {n} · 2 {dict.common.ml}
                    </li>
                  ))}
                </ul>
              </Accordion>
            ) : (
              <Accordion title={t.accNotes} open>
                <div className="space-y-3">
                  {noteRows
                    .filter(([, notes]) => notes.length > 0)
                    .map(([label, notes]) => (
                      <div key={label}>
                        <span className="text-[11px] uppercase tracking-wider text-bordeaux font-medium block">{label}</span>
                        <p className="text-noir font-serif mt-0.5">{notes.join(joiner)}</p>
                      </div>
                    ))}
                  {product.accords.length > 0 && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-bordeaux font-medium block mb-1.5">{t.mainAccords}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.accords.map((a) => (
                          <span key={a} className="latin px-2.5 py-1 text-[11px] bg-linen border border-linen-border">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Accordion>
            )}

            {product.wearProfile && (
              <Accordion title={t.accWear}>
                <p>{product.wearProfile}</p>
              </Accordion>
            )}

            {layerWith.length > 0 && (
              <Accordion title={t.accLayer}>
                <p className="text-xs text-stone-500 mb-4">{fill(t.layerHint, { name: shortName(product) })}</p>
                <ul className="space-y-3">
                  {layerWith.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 bg-linen border border-linen-border p-3">
                      <Link href={to(lang, `/product/${p.slug}`)} className="flex-1 min-w-0 group/l">
                        <span className="block text-sm font-serif font-bold text-noir group-hover/l:text-bordeaux truncate">
                          {displayName(p, lang, dict.concentration)}
                        </span>
                        <span className="block text-[11px] text-stone-500 truncate">
                          {subLine(p, lang, dict.genderTag, t.inspiredBy)}
                        </span>
                        <span className="latin block text-[11px] text-bordeaux mt-0.5">
                          {price(defaultVariant(p).price, lang)} · <bdi dir="ltr">{defaultVariant(p).sizeMl} ml</bdi>
                        </span>
                      </Link>
                      <AddBothButton product={product} partner={p} />
                    </li>
                  ))}
                </ul>
              </Accordion>
            )}

            <Accordion title={t.accDescription}>
              {product.tagline && <p className="font-serif text-lg text-noir mb-2">{product.tagline}</p>}
              <p>{text.description}</p>
            </Accordion>
          </div>
        </div>
      </div>

      {others.length > 0 && (
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
            {others.map((p) => (
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
