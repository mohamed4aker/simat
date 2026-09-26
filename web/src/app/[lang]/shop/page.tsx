import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fill, getDictionary, hasLocale } from '@/i18n';
import { to } from '@/lib/href';
import { priceNumber } from '@/lib/format';
import { categoryName } from '@/lib/localize';
import { getCategories, getProducts, type ProductQuery } from '@/lib/store';
import { ProductCard } from '@/components/product/ProductCard';
import { SortSelect } from '@/components/shop/SortSelect';
import { Eyebrow } from '@/components/ui/store';
import type { Concentration, Gender } from '@/lib/types';

export async function generateMetadata({ params }: PageProps<'/[lang]/shop'>): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).shop;
  return {
    title: t.title,
    description: t.intro,
    alternates: { canonical: `/${lang}/shop`, languages: { ar: '/ar/shop', en: '/en/shop' } },
  };
}

const GENDERS: Gender[] = ['women', 'men', 'unisex'];
const CONCENTRATIONS: Concentration[] = ['parfum', 'edp'];
const FAMILIES = ['oud', 'rose', 'leather', 'musk'] as const;
const PRICES = [1000, 3500, 4500];

export default async function ShopPage({ params, searchParams }: PageProps<'/[lang]/shop'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.shop;

  const sp = await searchParams;
  const one = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const current: Record<string, string | undefined> = {
    q: one('q'),
    category: one('category'),
    gender: one('gender'),
    concentration: one('concentration'),
    family: one('family'),
    max: one('max'),
    sort: one('sort'),
  };

  const query: ProductQuery = {
    search: current.q,
    category: current.category,
    gender: GENDERS.includes(current.gender as Gender) ? (current.gender as Gender) : undefined,
    concentration: CONCENTRATIONS.includes(current.concentration as Concentration)
      ? (current.concentration as Concentration)
      : undefined,
    family: current.family,
    maxPrice: current.max ? Number(current.max) || undefined : undefined,
    sort: (current.sort as ProductQuery['sort']) ?? 'featured',
  };

  const [categories, products] = await Promise.all([getCategories(), getProducts(query)]);
  const activeCategory = categories.find((c) => c.slug === current.category);

  /** رابط بيبدّل فلتر واحد ويسيب الباقي زي ما هو. */
  const hrefWith = (key: string, value?: string) => {
    const next = new URLSearchParams();
    Object.entries(current).forEach(([k, v]) => v && k !== key && next.set(k, v));
    if (value && current[key] !== value) next.set(key, value);
    const qs = next.toString();
    return to(lang, `/shop${qs ? `?${qs}` : ''}`);
  };

  const option = (key: string, value: string, label: string) => {
    const active = current[key] === value;
    return (
      <Link
        key={value}
        href={hrefWith(key, value)}
        scroll={false}
        aria-current={active ? 'true' : undefined}
        className={`flex items-center gap-2 py-0.5 ${active ? 'text-bordeaux font-medium' : 'text-stone-600 hover:text-noir'}`}
      >
        <span className={`w-3 h-3 border ${active ? 'bg-bordeaux border-bordeaux' : 'border-stone-400 bg-white'}`} />
        {label}
      </Link>
    );
  };

  const group = (title: string, children: React.ReactNode) => (
    <div>
      <span className="font-medium text-noir block mb-2 uppercase tracking-wider text-[11px]">{title}</span>
      <div className="space-y-1.5">{children}</div>
    </div>
  );

  const hasFilters = Object.entries(current).some(([k, v]) => v && k !== 'sort');

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <Eyebrow className="mb-1 !text-xs !tracking-widest">{t.eyebrow}</Eyebrow>
        <h1 className="text-4xl font-serif text-noir">
          {current.q
            ? fill(t.searchFor, { q: current.q })
            : activeCategory
              ? categoryName(activeCategory, lang)
              : t.title}
        </h1>
        <p className="text-xs text-stone-600 mt-2 max-w-xl">{t.intro}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3 bg-linen p-6 border border-linen-border text-xs">
          <details className="group lg:[&>summary]:pointer-events-none" open>
            <summary className="flex items-center justify-between pb-3 border-b border-linen-border cursor-pointer">
              <span className="font-serif font-bold uppercase tracking-wider text-noir text-sm">{t.filterTitle}</span>
              {hasFilters && (
                <Link href={to(lang, '/shop')} className="text-stone-500 hover:text-bordeaux underline pointer-events-auto">
                  {t.reset}
                </Link>
              )}
            </summary>
            <div className="space-y-6 pt-5">
              {group(t.gender, GENDERS.map((g) => option('gender', g, dict.gender[g])))}
              {group(
                t.concentration,
                CONCENTRATIONS.map((c) => option('concentration', c, dict.concentration[c])),
              )}
              {group(t.family, FAMILIES.map((f) => option('family', f, t.families[f])))}
              {group(
                dict.nav.collections,
                categories.map((c) => option('category', c.slug, categoryName(c, lang))),
              )}
              {group(
                t.maxPrice,
                PRICES.map((p) => option('max', String(p), `≤ ${priceNumber(p)} ${dict.common.currency}`)),
              )}
            </div>
          </details>
        </aside>

        <div className="lg:col-span-9 space-y-6">
          <div className="flex flex-wrap gap-3 justify-between items-center text-xs pb-3 border-b border-linen-border text-stone-500">
            <span>{fill(t.count, { count: products.length })}</span>
            <Suspense>
              <SortSelect />
            </Suspense>
          </div>
          {products.length === 0 ? (
            <div className="py-20 text-center text-sm text-stone-500">
              <p>{t.noResults}</p>
              <Link href={to(lang, '/shop')} className="mt-4 inline-block text-bordeaux underline">{t.reset}</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
