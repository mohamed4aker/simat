'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Heart, Minus, Plus } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n';
import { to } from '@/lib/href';
import { price, priceNumber } from '@/lib/format';
import { productText } from '@/lib/localize';
import { cartStore, useHydrated, useWishlist } from '@/components/cart/CartProvider';
import { btn } from '@/components/ui/store';
import { useBag } from './useBag';
import type { Product } from '@/lib/types';

/** اختيار الحجم والكمية، أضف للسلة، اطلب دلوقتي، وشريط الموبايل الثابت. */
export function BuyBox({ product, discoverySet }: { product: Product; discoverySet: Product | null }) {
  const { lang, dict } = useI18n();
  const t = dict.product;
  const bag = useBag();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const wishlist = useWishlist();
  const hydrated = useHydrated();
  const saved = hydrated && wishlist.includes(product.id);
  const soldOut = product.stock <= 0;
  const max = Math.max(1, Math.min(product.stock, 10));

  // شريط «أضف للسلة» الثابت تحت في الموبايل بيظهر بعد ما الزرار الأصلي يختفي.
  const actions = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = actions.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const buyNow = () => {
    cartStore.add(product, qty);
    router.push(to(lang, '/checkout'));
  };

  return (
    <>
      {product.kind === 'bottle' && discoverySet && (
        <div>
          <span className="block text-xs uppercase tracking-wider text-stone-600 mb-2">{t.chooseSize}</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 border border-bordeaux bg-white" aria-current="true">
              <span className="text-xs font-serif block text-noir">{fill(t.bottleOption, { size: product.sizeMl })}</span>
              <span className="text-[11px] text-stone-500">{fill(t.bottleOptionSub, { price: priceNumber(product.price) })}</span>
            </div>
            <Link
              href={to(lang, `/product/${discoverySet.slug}`)}
              className="p-3.5 border border-linen-border bg-linen/50 hover:border-bordeaux transition-colors"
            >
              <span className="text-xs font-serif block text-noir">{t.setOption}</span>
              <span className="text-[11px] text-stone-500">{fill(t.setOptionSub, { price: priceNumber(discoverySet.price) })}</span>
            </Link>
          </div>
        </div>
      )}

      <div ref={actions} className="space-y-3 pt-2">
        <div className="flex items-stretch gap-3">
          <div className="flex items-center border border-linen-border bg-white px-3 gap-4" role="group" aria-label={t.quantity}>
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-stone-600 hover:text-bordeaux" aria-label={dict.cart.decrease}>
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="latin text-xs font-medium w-4 text-center">{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} className="text-stone-600 hover:text-bordeaux" aria-label={dict.cart.increase}>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button type="button" disabled={soldOut} onClick={() => bag.add(product, qty)} className={`${btn.primary} flex-1 !px-4`}>
            {soldOut ? dict.common.outOfStock : dict.common.addToBag}
          </button>
          <button
            type="button"
            onClick={() => bag.toggleSaved(product)}
            className={`p-4 border transition-colors ${saved ? 'border-bordeaux text-bordeaux' : 'border-linen-border text-stone-500 hover:border-bordeaux hover:text-bordeaux'}`}
            aria-label={saved ? dict.wishlist.unsave : dict.wishlist.save}
            aria-pressed={saved}
          >
            <Heart className="w-5 h-5" strokeWidth={1.3} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
        {!soldOut && (
          <button type="button" onClick={buyNow} className={`${btn.dark} w-full`}>
            {t.buyNow}
          </button>
        )}
        {!soldOut && product.stock <= 5 && (
          <p className="text-[11px] text-bordeaux">{fill(dict.common.lowStock, { count: product.stock })}</p>
        )}
      </div>

      <aside
        aria-hidden={!showSticky}
        className={`fixed bottom-0 inset-x-0 z-30 md:hidden bg-linen-light/95 backdrop-blur-md border-t border-linen-border p-3.5 flex items-center justify-between gap-3 shadow-2xl transition-transform duration-300 ${
          showSticky ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="min-w-0">
          <h4 className="text-xs font-serif text-noir truncate">{productText(product, lang).name}</h4>
          <span className="latin text-[11px] text-bordeaux">{price(product.price, lang)}</span>
        </div>
        <button
          type="button"
          disabled={soldOut}
          tabIndex={showSticky ? 0 : -1}
          onClick={() => bag.add(product, qty)}
          className="px-5 py-2.5 bg-bordeaux hover:bg-bordeaux-dark text-linen-light text-[11px] tracking-wider uppercase font-medium shadow-md disabled:opacity-60"
        >
          {dict.common.addToBag}
        </button>
      </aside>
    </>
  );
}
