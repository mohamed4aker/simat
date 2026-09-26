'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { normalizeArabic, price } from '@/lib/format';
import { productText, shortName } from '@/lib/localize';
import { useUi, uiStore } from '@/components/cart/CartProvider';
import { Modal } from '@/components/ui/Modal';
import { Flacon } from '@/components/brand/Flacon';
import type { Product } from '@/lib/types';

/** بحث فوري في العطور بالاسم أو النوتات (عربي أو إنجليزي). */
export function SearchModal({ products }: { products: Product[] }) {
  const { lang, dict } = useI18n();
  const open = useUi().panel === 'search';
  const [query, setQuery] = useState('');
  const router = useRouter();
  const t = dict.search;

  const results = useMemo(() => {
    const q = normalizeArabic(query);
    if (q.length < 2) return [];
    return products.filter((p) =>
      normalizeArabic(
        [p.name, p.nameEn, p.family, p.familyEn, ...p.topNotes, ...p.heartNotes,
         ...p.baseNotes, ...p.topNotesEn, ...p.heartNotesEn, ...p.baseNotesEn].join(' '),
      ).includes(q),
    );
  }, [query, products]);

  const submit = (value: string) => {
    if (!value.trim()) return;
    uiStore.close();
    router.push(to(lang, `/shop?q=${encodeURIComponent(value.trim())}`));
  };

  return (
    <Modal open={open} onClose={() => uiStore.close()} label={t.title} closeLabel={dict.common.close}>
      <h3 className="text-sm font-serif text-bordeaux uppercase tracking-wider mb-3">{t.title}</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="flex items-center border-b-2 border-bordeaux py-2 gap-3"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          aria-label={t.title}
          className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
        />
        <button type="submit" className="text-bordeaux uppercase tracking-wider text-xs font-medium">
          {t.submit}
        </button>
      </form>

      {results.length > 0 ? (
        <ul className="mt-5 divide-y divide-linen-border">
          {results.map((p) => {
            const text = productText(p, lang);
            return (
              <li key={p.id}>
                <Link
                  href={to(lang, `/product/${p.slug}`)}
                  onClick={() => uiStore.close()}
                  className="flex items-center gap-4 py-3 hover:bg-linen transition-colors"
                >
                  <div className="w-12 h-14 bg-linen-dark border border-linen-border flex items-center justify-center overflow-hidden shrink-0">
                    <div className="scale-[0.3]">
                      <Flacon labelStyle={p.labelStyle} name={shortName(p)} concentration="" size="sm" kind={p.kind} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-serif text-noir font-bold truncate">{text.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{text.family}</p>
                  </div>
                  <span className="text-xs text-bordeaux latin">{price(p.price, lang)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-6">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 block mb-2">{t.quick}</span>
          <div className="flex flex-wrap gap-2 text-xs">
            {t.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="px-3 py-1.5 bg-linen border border-linen-border hover:border-bordeaux transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
