'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n';
import { priceNumber } from '@/lib/format';
import { productText } from '@/lib/localize';
import { useBag } from '@/components/product/useBag';
import { Eyebrow, SectionTitle, btn } from '@/components/ui/store';
import type { Product } from '@/lib/types';

const BASES = ['simat-bordeaux', 'simat-noir'] as const;
const VEILS = ['simat-ivoire', 'royal-velvet'] as const;

/** معمل الميكس: اختار عطر قاعدة + لمسة علوية والسعر بيتحسب. */
export function Layering({ products }: { products: Product[] }) {
  const { lang, dict } = useI18n();
  const t = dict.layering;
  const bag = useBag();
  const [base, setBase] = useState<string>(BASES[0]);
  const [veil, setVeil] = useState<string>(VEILS[0]);

  const find = (slug: string) => products.find((p) => p.slug === slug);
  const b = find(base);
  const v = find(veil);
  if (!b || !v) return null;

  const pairKey = `${base}+${veil}` as keyof typeof t.pairs;
  const options = t.options as Record<string, string>;

  const choice = (
    list: readonly string[],
    value: string,
    onChange: (v: string) => void,
    name: string,
  ) => (
    <div className="space-y-2 text-xs">
      {list.map((slug) => {
        const p = find(slug);
        if (!p) return null;
        return (
          <label
            key={slug}
            className={`flex items-center gap-2.5 p-2.5 border cursor-pointer transition-colors ${
              value === slug ? 'border-bordeaux bg-linen-light' : 'border-linen-border hover:border-bordeaux'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={slug}
              checked={value === slug}
              onChange={() => onChange(slug)}
              className="accent-bordeaux"
            />
            <span>
              <span className="font-serif block text-noir">
                {productText(p, lang).name} ({dict.concentrationShort[p.concentration]})
              </span>
              <span className="text-[10px] text-stone-500">{options[slug]}</span>
            </span>
          </label>
        );
      })}
    </div>
  );

  return (
    <section id="layering" className="max-w-7xl mx-auto px-6">
      <div className="mb-14">
        <SectionTitle center eyebrow={t.eyebrow} title={t.title} body={t.body} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-linen p-8 md:p-10 border border-linen-border">
        <div className="lg:col-span-5 space-y-4">
          <Eyebrow className="!text-xs !tracking-wider">{t.duoLabel}</Eyebrow>
          <h3 className="text-2xl font-serif text-noir">
            {productText(b, lang).name} + {productText(v, lang).name}
          </h3>
          <p className="text-xs text-stone-700 leading-relaxed min-h-[3.5rem]">{t.pairs[pairKey]}</p>
          <div className="pt-2">
            <span className="text-lg font-serif text-noir block font-medium">
              {fill(t.bothBottles, { amount: priceNumber(b.price + v.price) })}
            </span>
            <button type="button" onClick={() => bag.add([b, v])} className={`${btn.primary} mt-4 !px-6 !py-3.5`}>
              {t.addPair}
            </button>
          </div>
        </div>
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-linen-border space-y-3">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-serif block">{t.baseStep}</span>
            <h4 className="text-xs font-serif text-noir font-bold">{t.baseTitle}</h4>
            {choice(BASES, base, setBase, 'base_layer')}
          </div>
          <div className="p-5 bg-white border border-linen-border space-y-3">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-serif block">{t.topStep}</span>
            <h4 className="text-xs font-serif text-noir font-bold">{t.topTitle}</h4>
            {choice(VEILS, veil, setVeil, 'veil_layer')}
          </div>
        </div>
      </div>
    </section>
  );
}
