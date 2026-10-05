'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n/fill';
import { to } from '@/lib/href';
import { price } from '@/lib/format';
import { displayName, productText, subLine } from '@/lib/localize';
import { defaultVariant } from '@/lib/pricing';
import { useBag } from '@/components/product/useBag';
import { Eyebrow, btn } from '@/components/ui/store';
import type { Product } from '@/lib/types';

/** بيرشّح عطر من الكتالوج حسب الإجابات (الطابع + النوتة المفضلة). */
function recommend(answers: string[]): string {
  const [profile, , note] = answers;
  if (note === 'musk') return 'sanctum';
  if (profile === 'fresh') return 'flow';
  if (profile === 'fruit') return 'cloud';
  if (profile === 'warm' && note === 'oud') return 'regal';
  if (profile === 'warm') return 'soma';
  if (profile === 'rose') return 'imprint';
  if (note === 'amber') return 'imperium';
  return 'nocturne';
}

export function ScentFinder({ products }: { products: Product[] }) {
  const { lang, dict } = useI18n();
  const t = dict.quiz;
  const bag = useBag();
  const [answers, setAnswers] = useState<string[]>([]);
  const step = answers.length;
  const done = step >= t.steps.length;
  const result = done ? products.find((p) => p.slug === recommend(answers)) : null;

  return (
    <section id="scent-finder" className="max-w-4xl mx-auto px-6">
      <div className="border border-linen-border bg-linen p-8 md:p-12 shadow-sm text-center">
        <Eyebrow className="mb-2">{t.eyebrow}</Eyebrow>
        <h2 className="text-3xl sm:text-4xl font-serif text-noir mb-3">{t.title}</h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mb-10">{t.subtitle}</p>

        <div className="flex justify-center items-center gap-2 mb-8" aria-hidden="true">
          {t.steps.map((_, i) => (
            <span key={i} className={`w-8 h-1 transition-colors duration-500 ${i <= step ? 'bg-bordeaux' : 'bg-stone-300'}`} />
          ))}
        </div>

        <div className="min-h-[240px] flex flex-col justify-center" aria-live="polite">
          {!done ? (
            <div key={step} className="rise">
              <span className="text-xs uppercase tracking-wider text-stone-500 mb-2 block">
                {fill(t.step, { n: step + 1 })} · {t.steps[step].label}
              </span>
              <h3 className="text-xl font-serif text-noir mb-6">{t.steps[step].question}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {t.steps[step].options.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setAnswers([...answers, opt.key])}
                    className="p-4 bg-white border border-linen-border hover:border-bordeaux text-start transition-colors"
                  >
                    <span className="text-xs font-serif font-medium text-noir block">{opt.title}</span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">{opt.sub}</span>
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setAnswers(answers.slice(0, -1))}
                  className="mt-5 text-[11px] text-stone-500 hover:text-bordeaux"
                >
                  {t.back}
                </button>
              )}
            </div>
          ) : (
            result && (
              <div className="rise max-w-md mx-auto p-6 bg-white border border-bordeaux space-y-4">
                <span className="text-[10px] uppercase tracking-wider text-bordeaux font-serif font-bold block">{t.resultLabel}</span>
                <h3 className="text-2xl font-serif text-noir">{displayName(result, lang, dict.concentration)}</h3>
                <p className="text-[11px] text-stone-500">{subLine(result, lang, dict.genderTag, dict.product.inspiredBy)}</p>
                <p className="text-xs text-stone-600 leading-relaxed">{productText(result, lang).description}</p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <span className="latin text-sm font-serif font-medium text-noir">{price(defaultVariant(result).price, lang)}</span>
                  <button type="button" onClick={() => bag.add(result)} className={`${btn.primary} !px-5 !py-2.5`}>
                    {dict.common.addToCart}
                  </button>
                  <Link href={to(lang, `/product/${result.slug}`)} className="text-[11px] uppercase tracking-wider text-bordeaux hover:underline">
                    {t.viewProduct}
                  </Link>
                </div>
                <button type="button" onClick={() => setAnswers([])} className="text-[11px] text-stone-400 hover:text-bordeaux underline block mx-auto pt-2">
                  {t.retake}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
