'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { price } from '@/lib/format';
import { displayName, productText, shortName, subLine } from '@/lib/localize';
import { hasPrice, variantWithin, variantsOf } from '@/lib/pricing';
import { useHydrated, useWishlist } from '@/components/cart/CartProvider';
import { Flacon } from '@/components/brand/Flacon';
import { NotesModal } from './NotesModal';
import { ProductImage } from './ProductImage';
import { useBag } from './useBag';
import type { Product } from '@/lib/types';

/**
 * كارت المنتج:
 *   الاسم   «NOCTURNE — Eau de Parfum»
 *   سطر صغير «FOR HER · Inspired by Black Opium»
 *   السعر
 * الصورة الأساسية للزجاجة، ولما الماوس يقف عليها بتتبدل لصورة
 * الزجاجة وسط المكونات الطبيعية.
 */
export function ProductCard({ product, budget }: { product: Product; budget?: number }) {
  const { lang, dict } = useI18n();
  const bag = useBag();
  const wishlist = useWishlist();
  const hydrated = useHydrated();
  const saved = hydrated && wishlist.includes(product.id);
  const [notesOpen, setNotesOpen] = useState(false);
  const href = to(lang, `/product/${product.slug}`);
  const title = displayName(product, lang, dict.concentration);
  // مع فلتر «أقصى سعر» الكارت بيعرض أكبر حجم في حدود المبلغ (وإلا 60 مل).
  const sizes = product.kind === 'bottle' ? variantsOf(product) : [];
  // الحجم اللي العميل وقف عليه أو داس عليه — السعر وزرار السلة بيمشوا وراه.
  const [picked, setPicked] = useState<number | null>(null);
  const variant = sizes.find((v) => v.sizeMl === picked) ?? variantWithin(product, budget);
  const priced = hasPrice(product);

  return (
    <article className="flip-card group relative bg-white border border-linen-border p-2.5 sm:p-3 flex flex-col justify-between hover:border-bordeaux/40 hover:shadow-lg transition-all duration-300">
      <button
        type="button"
        onClick={() => bag.toggleSaved(product)}
        className={`absolute top-4 end-4 z-20 p-1 transition-colors ${saved ? 'text-bordeaux' : 'text-stone-400 hover:text-bordeaux'}`}
        aria-label={saved ? dict.wishlist.unsave : dict.wishlist.save}
        aria-pressed={saved}
      >
        <Heart className="w-[18px] h-[18px]" strokeWidth={1.4} fill={saved ? 'currentColor' : 'none'} />
      </button>

      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#ece6dc] mb-3">
        <Link href={href} aria-label={title} className="absolute inset-0">
          {/* الصورة الأساسية: الزجاجة لوحدها */}
          <div className="flip-primary absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#f2ece1] to-[#e5ddd0]">
            {product.imageUrl ? (
              <ProductImage src={product.imageUrl} alt={title} />
            ) : (
              <Flacon
                labelStyle={product.labelStyle}
                name={shortName(product)}
                concentration={dict.concentrationShort[product.concentration]}
                kind={product.kind}
              />
            )}
          </div>

          {/* عند الوقوف بالماوس: الزجاجة وسط المكونات */}
          <div className="flip-secondary absolute inset-0">
            {product.hoverImageUrl ? (
              <ProductImage src={product.hoverImageUrl} alt={title} />
            ) : (
              <IngredientsFace product={product} />
            )}
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

      <div className="flex flex-col flex-1">
        <h3 className="latin text-[13px] sm:text-sm font-serif text-noir font-bold leading-snug">
          <Link href={href} className="hover:text-bordeaux transition-colors"><bdi>{title}</bdi></Link>
        </h3>
        <p className="mt-0.5 text-[10.5px] sm:text-[11px] text-stone-500 line-clamp-1">
          {subLine(product, lang, dict.genderTag, dict.product.inspiredBy)}
        </p>

        {/* الأحجام: الوقوف بالماوس أو الضغط على حجم بيغيّر السعر */}
        {sizes.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label={dict.product.size}>
            {sizes.map((v) => {
              const active = v.sizeMl === variant.sizeMl;
              return (
                <button
                  key={v.sizeMl}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  dir="ltr"
                  onMouseEnter={() => setPicked(v.sizeMl)}
                  onFocus={() => setPicked(v.sizeMl)}
                  onClick={() => setPicked(v.sizeMl)}
                  className={`latin text-[10px] px-1.5 py-0.5 border transition-colors ${
                    active
                      ? 'border-bordeaux bg-bordeaux text-linen-light'
                      : 'border-linen-border bg-linen text-stone-600 hover:border-bordeaux/60'
                  }`}
                >
                  {v.sizeMl} ml
                </button>
              );
            })}
          </div>
        )}

        <p className="latin mt-2 mb-3 text-sm text-bordeaux font-semibold">
          {priced ? price(variant.price, lang) : dict.common.priceSoon}
          {priced && sizes.length > 1 && (
            <span className="ms-1 text-[10px] text-stone-400 font-normal">/ <bdi dir="ltr">{variant.sizeMl} ml</bdi></span>
          )}
        </p>

        <button
          type="button"
          onClick={() => bag.add(product, 1, variant.sizeMl)}
          disabled={!priced || product.stock <= 0}
          className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-bordeaux hover:bg-bordeaux-light active:bg-bordeaux-dark text-linen-light text-[11px] sm:text-xs font-semibold tracking-wide transition-colors disabled:bg-stone-300 disabled:text-stone-600 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" strokeWidth={1.8} />
          {!priced ? dict.common.comingSoon : product.stock > 0 ? dict.common.addToCart : dict.common.outOfStock}
        </button>
      </div>

      {product.kind === 'bottle' && (
        <NotesModal product={product} open={notesOpen} onClose={() => setNotesOpen(false)} />
      )}
    </article>
  );
}

/**
 * لحد ما توصل صور «الزجاجة وسط المكونات»: لوحة بالطابع والمكونات
 * الأساسية للعطر بنفس الإحساس.
 */
function IngredientsFace({ product }: { product: Product }) {
  const { lang } = useI18n();
  const text = productText(product, lang);
  const notes = [...text.top, ...text.heart].slice(0, 5);
  return (
    <div className="absolute inset-0 bg-noir flex flex-col items-center justify-center gap-4 p-6 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,#c5a880_0,transparent_45%),radial-gradient(circle_at_75%_80%,#721924_0,transparent_50%)]" />
      <span className="relative text-[10px] uppercase tracking-[0.25em] text-gold">{text.family}</span>
      <div className="relative flex flex-wrap justify-center gap-1.5 max-w-[220px]">
        {notes.map((n) => (
          <span key={n} className="px-2.5 py-1 text-[10px] text-linen-light/90 border border-white/20 rounded-full">
            {n}
          </span>
        ))}
      </div>
      {text.accords.length > 0 && (
        <span className="relative text-[10px] text-stone-400">{text.accords.join(' · ')}</span>
      )}
    </div>
  );
}
