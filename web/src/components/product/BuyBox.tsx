'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n/fill';
import { to } from '@/lib/href';
import { price } from '@/lib/format';
import { displayName } from '@/lib/localize';
import { defaultVariant, variantsOf } from '@/lib/pricing';
import { cartStore } from '@/components/cart/CartProvider';
import { btn } from '@/components/ui/store';
import { useBag } from './useBag';
import type { Product } from '@/lib/types';

/**
 * السعر + أزرار الأحجام (60 مل مختار افتراضياً) + الكمية
 * + ADD TO CART + BUY IT NOW، وشريط الشراء الثابت في الموبايل.
 */
export function BuyBox({ product }: { product: Product }) {
  const { lang, dict } = useI18n();
  const t = dict.product;
  const bag = useBag();
  const router = useRouter();
  const variants = variantsOf(product);
  const [size, setSize] = useState(defaultVariant(product).sizeMl);
  const [qty, setQty] = useState(1);
  const current = variants.find((v) => v.sizeMl === size) ?? variants[0];
  const soldOut = product.stock <= 0;
  const max = Math.max(1, Math.min(product.stock, 10));
  const title = displayName(product, lang, dict.concentration);

  // الشريط الثابت يظهر بس بعد ما زرار الشراء الأصلي يطلع برّه الشاشة لفوق.
  const actions = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = actions.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) =>
      setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const addToCart = () => bag.add(product, qty, current.sizeMl);
  const buyNow = () => {
    cartStore.add(product, qty, current.sizeMl);
    router.push(to(lang, '/checkout'));
  };

  return (
    <>
      <p className="latin text-2xl text-noir tracking-wide" aria-live="polite">
        {price(current.price, lang)}
      </p>

      {product.kind === 'bottle' && variants.length > 1 && (
        <div>
          <span className="block text-[11px] uppercase tracking-wider text-stone-600 mb-2">{t.size}</span>
          <div role="radiogroup" aria-label={t.size} className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const active = v.sizeMl === current.sizeMl;
              return (
                <button
                  key={v.sizeMl}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSize(v.sizeMl)}
                  className={`latin min-w-[84px] px-4 py-2.5 border text-sm transition-colors ${
                    active
                      ? 'border-bordeaux bg-bordeaux text-linen-light'
                      : 'border-linen-border bg-white text-noir hover:border-bordeaux'
                  }`}
                >
                  <bdi dir="ltr">{v.sizeMl} ml</bdi>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div ref={actions} className="space-y-3 pt-1">
        <div className="flex items-stretch gap-3">
          <div className="flex items-center border border-linen-border bg-white px-3 gap-4" role="group" aria-label={t.quantity}>
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-stone-600 hover:text-bordeaux p-1" aria-label={dict.cart.decrease}>
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="latin text-sm font-medium w-4 text-center">{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} className="text-stone-600 hover:text-bordeaux p-1" aria-label={dict.cart.increase}>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button type="button" disabled={soldOut} onClick={addToCart} className={`${btn.primary} flex-1 !px-4`}>
            {soldOut ? dict.common.outOfStock : dict.common.addToCart}
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

      {/* شريط الشراء الثابت في الموبايل */}
      <aside
        aria-hidden={!showSticky}
        className={`fixed bottom-0 inset-x-0 z-30 md:hidden bg-linen-light/95 backdrop-blur-md border-t border-linen-border px-4 py-3 flex items-center justify-between gap-3 shadow-2xl transition-transform duration-300 ${
          showSticky ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="min-w-0">
          <h4 className="text-xs font-serif text-noir truncate">{title}</h4>
          <span className="latin text-[11px] text-bordeaux">
            {price(current.price, lang)}
            {product.kind === 'bottle' && <> · <bdi dir="ltr">{current.sizeMl} ml</bdi></>}
          </span>
        </div>
        <button
          type="button"
          disabled={soldOut}
          tabIndex={showSticky ? 0 : -1}
          onClick={addToCart}
          className="shrink-0 px-5 py-2.5 bg-bordeaux hover:bg-bordeaux-dark text-linen-light text-[11px] tracking-wider uppercase font-medium shadow-md disabled:opacity-60"
        >
          {dict.common.addToCart}
        </button>
      </aside>
    </>
  );
}
