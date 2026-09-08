'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import type { Category } from '@/lib/types';

const GENDERS = [
  { value: 'men', label: 'رجالي' },
  { value: 'women', label: 'حريمي' },
  { value: 'unisex', label: 'للجنسين' },
];

const CONCENTRATIONS = [
  { value: 'parfum', label: 'Parfum' },
  { value: 'edp', label: 'EDP' },
  { value: 'edt', label: 'EDT' },
  { value: 'oil', label: 'زيت' },
  { value: 'mist', label: 'ميست' },
];

const SORTS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price-asc', label: 'الأقل سعراً' },
  { value: 'price-desc', label: 'الأعلى سعراً' },
  { value: 'rating', label: 'الأعلى تقييماً' },
  { value: 'best-selling', label: 'الأكثر مبيعاً' },
];

export function ShopFilters({
  categories,
  resultCount,
}: {
  categories: Category[];
  resultCount: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(params.get('q') ?? '');

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    router.push(`/shop?${next.toString()}`, { scroll: false });
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    update('q', search.trim() || null);
  }

  const activeCount = ['category', 'gender', 'concentration', 'offers', 'stock']
    .filter((k) => params.get(k))
    .length;

  const chip = (active: boolean) =>
    `px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-colors ${
      active
        ? 'bg-wine text-white border-wine'
        : 'bg-surface text-charcoal border-line hover:border-copper'
    }`;

  return (
    <div className="mb-8">
      <form onSubmit={submitSearch} className="relative mb-4">
        <Search
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن عطر، ماركة، أو نوتة عطرية..."
          className="w-full rounded-xl border border-line bg-surface pr-11 pl-4 py-3 text-sm outline-none focus:border-wine"
          aria-label="بحث في المنتجات"
        />
      </form>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-bold hover:border-copper"
        >
          <SlidersHorizontal size={16} />
          فلترة
          {activeCount > 0 && (
            <span className="grid place-items-center w-5 h-5 rounded-full bg-copper text-white text-[11px]">
              {activeCount}
            </span>
          )}
        </button>

        <select
          value={params.get('sort') ?? 'newest'}
          onChange={(e) => update('sort', e.target.value)}
          aria-label="ترتيب المنتجات"
          className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-bold outline-none focus:border-wine"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <span className="text-sm text-faint">{resultCount} منتج</span>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push('/shop')}
            className="inline-flex items-center gap-1 text-sm text-bad font-semibold"
          >
            <X size={14} /> مسح الفلاتر
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold mb-2.5">التصنيف</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update('category', null)}
                className={chip(!params.get('category'))}
              >
                الكل
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => update('category', c.slug)}
                  className={chip(params.get('category') === c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-2.5">الفئة</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update('gender', null)}
                className={chip(!params.get('gender'))}
              >
                الكل
              </button>
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => update('gender', g.value)}
                  className={chip(params.get('gender') === g.value)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-2.5">التركيز</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update('concentration', null)}
                className={chip(!params.get('concentration'))}
              >
                الكل
              </button>
              {CONCENTRATIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => update('concentration', c.value)}
                  className={chip(params.get('concentration') === c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => update('offers', params.get('offers') ? null : '1')}
              className={chip(Boolean(params.get('offers')))}
            >
              العروض بس
            </button>
            <button
              type="button"
              onClick={() => update('stock', params.get('stock') ? null : '1')}
              className={chip(Boolean(params.get('stock')))}
            >
              المتوفر بس
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
