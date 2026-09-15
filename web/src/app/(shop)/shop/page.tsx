import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PackageSearch } from 'lucide-react';

import { ProductGrid } from '@/components/product/ProductCard';
import { ShopFilters } from '@/components/product/ShopFilters';
import { getCategories, getProducts, type ProductQuery } from '@/lib/store';
import type { Concentration, Gender } from '@/lib/types';

export const metadata: Metadata = {
  title: 'المتجر — كل العطور',
  description:
    'تصفّح كل عطور سِمة: شرقية، فرنسية، عود ودهن، نيتش فاخر، بادي ميست '
    + 'وأطقم هدايا. فلترة بالسعر والفئة والتركيز، وشحن لكل محافظات مصر.',
  alternates: { canonical: '/shop' },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const query: ProductQuery = {
    search: one('q'),
    category: one('category'),
    gender: one('gender') as Gender | undefined,
    concentration: one('concentration') as Concentration | undefined,
    onlyOffers: Boolean(one('offers')),
    inStock: Boolean(one('stock')),
    sort: (one('sort') as ProductQuery['sort']) ?? 'newest',
  };

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(query),
  ]);

  const activeCategory = categories.find((c) => c.slug === query.category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold">
          {activeCategory ? activeCategory.name : 'كل العطور'}
        </h1>
        <p className="mt-2 text-muted">
          {activeCategory
            ? activeCategory.description
            : 'تشكيلة سِمة كاملة — اختار اللي يناسب سِمتك'}
        </p>
      </header>

      <Suspense fallback={<div className="h-28" />}>
        <ShopFilters categories={categories} resultCount={products.length} />
      </Suspense>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <PackageSearch size={56} className="mx-auto text-sand" />
          <h2 className="mt-5 text-lg font-bold">مفيش منتجات مطابقة</h2>
          <p className="mt-2 text-muted text-sm">
            جرّب تغيّر الفلاتر أو تبحث بكلمة تانية زي «عود» أو «ورد».
          </p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
