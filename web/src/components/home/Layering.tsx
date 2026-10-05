'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n/fill';
import { priceNumber } from '@/lib/format';
import { shortName } from '@/lib/localize';
import { defaultVariant } from '@/lib/pricing';
import { useBag } from '@/components/product/useBag';
import { Eyebrow, SectionTitle, btn } from '@/components/ui/store';
import type { Product } from '@/lib/types';

// عطور القاعدة (دافية وتقيلة) واللمسة العلوية (أخف وأنعم).
const BASES = ['soma', 'shadow', 'imperium'] as const;
const TOPS = ['cloud', 'sanctum', 'flow'] as const;

/** معمل الميكس: اختار عطر قاعدة + لمسة علوية والسعر بيتحسب (60 مل). */
export function Layering({ products }: { products: Product[] }) {
  const { dict } = useI18n();
  const t = dict.layering;
  const bag = useBag();
  const find = (slug: string) => products.find((p) => p.slug === slug);
  const bases = BASES.map(find).filter((p): p is Product => Boolean(p));
  const tops = TOPS.map(find).filter((p): p is Product => Boolean(p));
  const [baseSlug, setBase] = useState<string>(bases[0]?.slug ?? '');
  const [topSlug, setTop] = useState<string>(tops[0]?.slug ?? '');

  const b = find(baseSlug);
  const v = find(topSlug);
  if (!b || !v) return null;

  const choice = (
    list: Product[],
    value: string,
    onChange: (v: string) => void,
    name: string,
  ) => (
    <div className="space-y-2 text-xs">
      {list.map((p) => (
        <label
          key={p.slug}
          className={`flex items-center gap-2.5 p-2.5 border cursor-pointer transition-colors ${
            value === p.slug ? 'border-bordeaux bg-linen-light' : 'border-linen-border hover:border-bordeaux'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={p.slug}
            checked={value === p.slug}
            onChange={() => onChange(p.slug)}
            className="accent-bordeaux"
          />
          <span>
            <span className="font-serif block text-noir">{shortName(p)}</span>
            <span className="latin text-[10px] text-stone-500">{p.familyEn}</span>
          </span>
        </label>
      ))}
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
            {shortName(b)} + {shortName(v)}
          </h3>
          <p className="text-xs text-stone-700 leading-relaxed min-h-[3.5rem]">
            {fill(t.pairTemplate, {
              base: shortName(b),
              top: shortName(v),
              baseFamily: b.familyEn.toLowerCase(),
              topFamily: v.familyEn.toLowerCase(),
            })}
          </p>
          <div className="pt-2">
            <span className="text-lg font-serif text-noir block font-medium">
              {fill(t.bothBottles, { amount: priceNumber(defaultVariant(b).price + defaultVariant(v).price) })}
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
            {choice(bases, baseSlug, setBase, 'base_layer')}
          </div>
          <div className="p-5 bg-white border border-linen-border space-y-3">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-serif block">{t.topStep}</span>
            <h4 className="text-xs font-serif text-noir font-bold">{t.topTitle}</h4>
            {choice(tops, topSlug, setTop, 'veil_layer')}
          </div>
        </div>
      </div>
    </section>
  );
}
