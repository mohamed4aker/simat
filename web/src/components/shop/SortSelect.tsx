'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/i18n/I18nProvider';

export function SortSelect() {
  const { dict } = useI18n();
  const t = dict.shop;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2">
      <span className="uppercase tracking-wider">{t.sort}</span>
      <select
        value={params.get('sort') ?? 'featured'}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value === 'featured') next.delete('sort');
          else next.set('sort', e.target.value);
          const qs = next.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="bg-transparent border border-linen-border p-1.5 text-noir outline-none focus:border-bordeaux"
      >
        <option value="featured">{t.sortFeatured}</option>
        <option value="best-selling">{t.sortBest}</option>
        <option value="price-asc">{t.sortLow}</option>
        <option value="price-desc">{t.sortHigh}</option>
      </select>
    </label>
  );
}
