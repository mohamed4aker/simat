'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { price } from '@/lib/format';
import { productText, shortName } from '@/lib/localize';
import { useHydrated, useWishlist } from '@/components/cart/CartProvider';
import { Flacon } from '@/components/brand/Flacon';
import { NotesModal } from './NotesModal';
import { useBag } from './useBag';
import type { Product } from '@/lib/types';

/**
 * كارت المنتج: الزجاجة بتقلب لكارت «ضمان العينة» لما الماوس يعدّي،
 * وزرار سريع لمكونات العطر.
 */
export function ProductCard({ product }: { product: Product }) {
  const { lang, dict } = useI18n();
  const text = productText(product, lang);
  const bag = useBag();
  const wishlist = useWishlist();
  const hydrated = useHydrated();
  const saved = hydrated && wishlist.includes(product.id);
  const [notesOpen, setNotesOpen] = useState(false);
  const href = to(lang, `/product/${product.slug}`);
  const t = dict.bestsellers;

  return (
    <article className="flip-card group relative bg-linen-light border border-linen-border p-4 flex flex-col justify-between hover:border-bordeaux/40 hover:shadow-xl transition-all duration-300">
      <button
        type="button"
        onClick={() => bag.toggleSaved(product)}
        className={`absolute top-6 end-6 z-20 p-1 transition-colors ${saved ? 'text-bordeaux' : 'text-stone-400 hover:text-bordeaux'}`}
        aria-label={saved ? dict.wishlist.unsave : dict.wishlist.save}
        aria-pressed={saved}
      >
        <Heart className="w-5 h-5" strokeWidth={1.3} fill={saved ? 'currentColor' : 'none'} />
      </button>

      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#ece6dc] mb-4 border border-linen-border/70">
        <Link href={href} aria-label={text.name} className="absolute inset-0">
          <div className="flip-primary absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#f2ece1] to-[#e5ddd0]">
            <Flacon
              labelStyle={product.labelStyle}
              name={shortName(product)}
              concentration={dict.concentrationShort[product.concentration]}
              imageUrl={product.imageUrl}
              alt={text.name}
              kind={product.kind}
            />
          </div>
          <div
            className={`flip-secondary absolute inset-0 flex items-center justify-center p-6 text-center ${
              product.labelStyle === 'noir' ? 'simat-pattern-wrap' : 'bg-noir'
            }`}
          >
            <div className="bg-linen-light p-4 border border-linen-border shadow-2xl max-w-[200px]">
              <span className="text-[9px] uppercase tracking-wider text-bordeaux font-serif block mb-1 font-bold">
                {t.cardGuaranteeLabel}
              </span>
              <p className="text-xs font-serif text-noir font-medium">{t.cardGuaranteeTitle}</p>
              <span className="text-[10px] text-stone-500 block mt-1">{t.cardGuaranteeSub}</span>
            </div>
          </div>
        </Link>
        {product.kind === 'bottle' && (
          <button
            type="button"
            onClick={() => setNotesOpen(true)}
            className="absolute bottom-3 inset-x-3 z-10 py-2 bg-linen-light/95 hover:bg-bordeaux hover:text-white text-noir text-[11px] tracking-wider uppercase transition-all md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 shadow-sm border border-linen-border"
          >
            {dict.common.notes}
          </button>
        )}
      </div>

      <div>
        <span className="text-[10px] text-bordeaux font-serif block font-bold">{text.family}</span>
        <h3 className="text-base font-serif text-noir font-bold">
          <Link href={href} className="hover:text-bordeaux transition-colors">{text.name}</Link>
        </h3>
        <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{text.description}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-linen-border">
          <span className="latin text-sm text-noir tracking-wider font-medium">{price(product.price, lang)}</span>
          <button
            type="button"
            onClick={() => bag.add(product)}
            disabled={product.stock <= 0}
            className="text-[11px] uppercase tracking-wider text-bordeaux hover:underline font-medium disabled:text-stone-400 disabled:no-underline"
          >
            {product.stock > 0 ? `+ ${dict.common.addToBag}` : dict.common.outOfStock}
          </button>
        </div>
      </div>

      {product.kind === 'bottle' && (
        <NotesModal product={product} open={notesOpen} onClose={() => setNotesOpen(false)} />
      )}
    </article>
  );
}
