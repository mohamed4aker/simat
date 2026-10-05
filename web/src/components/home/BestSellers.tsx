'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { ProductCard } from '@/components/product/ProductCard';
import { Eyebrow } from '@/components/ui/store';
import type { Product } from '@/lib/types';

type Tab = 'all' | 'women' | 'men' | 'unisex';

export function BestSellers({ products }: { products: Product[] }) {
  const { dict } = useI18n();
  const t = dict.bestsellers;
  const [tab, setTab] = useState<Tab>('all');
  const list = tab === 'all' ? products.slice(0, 8) : products.filter((p) => p.gender === tab).slice(0, 8);

  const tabs: [Tab, string][] = [
    ['all', t.tabAll],
    ['women', t.tabHer],
    ['men', t.tabHim],
    ['unisex', t.tabUnisex],
  ];

  return (
    <section className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <Eyebrow className="mb-1">{t.eyebrow}</Eyebrow>
          <h2 className="text-3xl sm:text-4xl font-serif text-noir">{t.title}</h2>
        </div>
        <div role="tablist" className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-wider">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={
                tab === key
                  ? 'text-bordeaux font-medium underline underline-offset-4'
                  : 'text-stone-500 hover:text-noir'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
