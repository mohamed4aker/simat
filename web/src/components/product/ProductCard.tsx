'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { price } from '@/lib/format';
import { displayName, shortName, subLine } from '@/lib/localize';
import { defaultVariant } from '@/lib/pricing';
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
export function ProductCard({ product }: { product: Product }) {
  const { lang, dict } = useI18n();
  const bag = useBag();
  const wishlist = useWishlist();
  const hydrated = useHydrated();
  const saved = hydrated && wishlist.includes(product.id);
  const [notesOpen, setNotesOpen] = useState(false);
  const href = to(lang, `/product/${product.slug}`);
  const title = displayName(product, lang, dict.concentration);
  const variant = defaultVariant(product);

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

      <div>
        <h3 className="text-[15px] font-serif text-noir font-bold leading-snug">
          <Link href={href} className="hover:text-bordeaux transition-colors">{title}</Link>
        </h3>
        <p className="mt-1 text-[11px] text-stone-500 tracking-wide">
          {subLine(product, lang, dict.genderTag, dict.product.inspiredBy)}
        </p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-linen-border gap-2">
          <span className="latin text-sm text-noir tracking-wider font-medium">
            {price(variant.price, lang)}
            {product.kind === 'bottle' && (
              <span className="ms-1.5 text-[10px] text-stone-400 font-normal">· <bdi dir="ltr">{variant.sizeMl} ml</bdi></span>
            )}
          </span>
          <button
            type="button"
            onClick={() => bag.add(product)}
            disabled={product.stock <= 0}
            className="text-[11px] uppercase tracking-wider text-bordeaux hover:underline font-medium disabled:text-stone-400 disabled:no-underline whitespace-nowrap"
          >
            {product.stock > 0 ? `+ ${dict.common.addToCart}` : dict.common.outOfStock}
          </button>
        </div>
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
  const notes = [...product.topNotesEn, ...product.heartNotesEn].slice(0, 5);
  return (
    <div className="absolute inset-0 bg-noir flex flex-col items-center justify-center gap-4 p-6 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,#c5a880_0,transparent_45%),radial-gradient(circle_at_75%_80%,#721924_0,transparent_50%)]" />
      <span className="relative latin text-[10px] uppercase tracking-[0.25em] text-gold">{product.familyEn}</span>
      <div className="relative flex flex-wrap justify-center gap-1.5 max-w-[220px]">
        {notes.map((n) => (
          <span key={n} className="latin px-2.5 py-1 text-[10px] text-linen-light/90 border border-white/20 rounded-full">
            {n}
          </span>
        ))}
      </div>
      {product.accords.length > 0 && (
        <span className="relative latin text-[10px] text-stone-400">{product.accords.join(' · ')}</span>
      )}
    </div>
  );
}
