'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n';
import { to } from '@/lib/href';
import { price, priceNumber } from '@/lib/format';
import { lineName } from '@/lib/localize';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { checkCoupon } from '@/lib/actions/checkout';
import { cartStore, useCart, useUi, uiStore } from './CartProvider';
import { useLockScroll } from '@/components/ui/Modal';
import { Flacon } from '@/components/brand/Flacon';
import { btn, field } from '@/components/ui/store';

/** السلة الجانبية: كود الخصم، عدّاد الشحن المجاني، الهدية، والإجمالي. */
export function CartDrawer() {
  const { lang, dict } = useI18n();
  const t = dict.cart;
  const open = useUi().panel === 'cart';
  const cart = useCart();
  useLockScroll(open);

  const discount = cart.coupon?.discount ?? 0;
  const afterDiscount = Math.max(0, cart.subtotal - discount);
  const freeShipping = cart.subtotal >= FREE_SHIPPING_THRESHOLD;
  const progress = Math.min(100, Math.round((cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none invisible'
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-noir/60 backdrop-blur-sm" onClick={() => uiStore.close()} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        className={`absolute inset-y-0 end-0 w-full max-w-md bg-linen-light shadow-2xl flex flex-col border-s border-linen-border transition-transform duration-300 ease-[var(--ease-lux)] ${
          open ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'
        }`}
        onKeyDown={(e) => e.key === 'Escape' && uiStore.close()}
      >
        <div className="p-6 border-b border-linen-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm uppercase tracking-wider font-serif text-noir font-bold">{t.title}</h3>
            <span className="latin text-xs text-stone-500">({cart.ready ? cart.count : 0})</span>
          </div>
          <button type="button" onClick={() => uiStore.close()} className="p-1 text-stone-400 hover:text-bordeaux" aria-label={dict.common.close}>
            <X className="w-5 h-5" strokeWidth={1.3} />
          </button>
        </div>

        {cart.ready && cart.lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
            <p className="text-sm text-stone-500">{t.empty}</p>
            <Link href={to(lang, '/shop')} onClick={() => uiStore.close()} className={btn.outline}>
              {t.continue}
            </Link>
          </div>
        ) : (
          <>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <PromoBox subtotal={cart.subtotal} />

              {/* عدّاد الشحن المجاني */}
              <div className="bg-[#efe9df]/90 p-4 border border-linen-border">
                <div className="flex justify-between items-center text-[11px] mb-2 gap-3">
                  <span className="text-stone-800">
                    {freeShipping
                      ? t.meterUnlocked
                      : fill(t.meterRemaining, { amount: priceNumber(FREE_SHIPPING_THRESHOLD - cart.subtotal) })}
                  </span>
                  <span className="latin text-bordeaux font-medium text-[10px]">{progress}%</span>
                </div>
                <div className="w-full bg-stone-300/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-bordeaux h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <ul className="space-y-4">
                {cart.lines.map((line) => (
                  <li key={line.productId} className="flex gap-4 border-b border-linen-border pb-4">
                    <Link
                      href={to(lang, `/product/${line.slug}`)}
                      onClick={() => uiStore.close()}
                      className="w-16 h-20 bg-[#ebe5db] shrink-0 border border-linen-border flex items-center justify-center overflow-hidden"
                    >
                      <div className="scale-[0.34]">
                        <Flacon labelStyle={line.labelStyle ?? 'bordeaux'} name="" concentration="" size="sm" kind={line.kind} />
                      </div>
                    </Link>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-serif text-noir uppercase tracking-wider font-bold truncate">
                            {lineName(line, lang)}
                          </h4>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            {line.kind === 'set' ? '5 × 2 ' + dict.common.ml : `${line.sizeMl} ${dict.common.ml}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => cartStore.remove(line.productId)}
                          className="text-stone-400 hover:text-bordeaux"
                          aria-label={dict.common.remove}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2">
                        <span className="latin text-bordeaux font-medium">{price(line.price * line.quantity, lang)}</span>
                        <div className="flex items-center border border-linen-border bg-white px-2 py-1 gap-3">
                          <button type="button" onClick={() => cartStore.setQuantity(line.productId, line.quantity - 1)} className="text-stone-600 hover:text-bordeaux" aria-label={t.decrease}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="latin text-xs font-medium w-3 text-center">{line.quantity}</span>
                          <button type="button" onClick={() => cartStore.setQuantity(line.productId, line.quantity + 1)} className="text-stone-600 hover:text-bordeaux" aria-label={t.increase}>
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* هدية */}
              <div className="bg-linen p-4 border border-linen-border space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cart.isGift}
                    onChange={(e) => cartStore.setGift(e.target.checked)}
                    className="mt-1 accent-bordeaux"
                  />
                  <span className="text-xs text-stone-800 leading-snug">{t.giftToggle}</span>
                </label>
                {cart.isGift && (
                  <div className="pt-1 space-y-2">
                    <label htmlFor="gift-msg" className="block text-[10px] uppercase tracking-wider text-stone-600">
                      {t.giftLabel}
                    </label>
                    <textarea
                      id="gift-msg"
                      rows={2}
                      maxLength={160}
                      value={cart.giftMessage}
                      onChange={(e) => cartStore.setGift(true, e.target.value)}
                      placeholder={t.giftPlaceholder}
                      className={`${field} text-xs`}
                    />
                    <span className="text-[10px] text-stone-500 block italic">{t.giftHidePrices}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-linen-dark/40 border border-linen-border text-[11px] text-stone-600 leading-relaxed">
                <span className="font-medium text-bordeaux block mb-1">{t.guaranteeTitle}</span>
                <p>{t.guaranteeBody}</p>
              </div>
            </div>

            <div className="p-6 border-t border-linen-border bg-linen space-y-4">
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <dt>{t.subtotal}</dt>
                  <dd className="latin">{price(cart.subtotal, lang)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>{t.discount} ({cart.coupon?.code})</dt>
                    <dd className="latin">−{price(discount, lang)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <dt>{t.shipping}</dt>
                  <dd className={freeShipping ? 'text-emerald-700 font-medium' : ''}>
                    {freeShipping ? t.free : t.shippingAtCheckout}
                  </dd>
                </div>
                <div className="flex justify-between text-sm font-medium text-noir pt-2 border-t border-linen-border">
                  <dt>{t.total}</dt>
                  <dd className="latin text-bordeaux font-bold">{price(afterDiscount, lang)}</dd>
                </div>
              </dl>
              <Link href={to(lang, '/checkout')} onClick={() => uiStore.close()} className={`${btn.primary} w-full`}>
                {t.checkout}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function PromoBox({ subtotal }: { subtotal: number }) {
  const { lang, dict } = useI18n();
  const t = dict.cart;
  const { coupon } = useCart();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const apply = () =>
    start(async () => {
      setError('');
      const res = await checkCoupon(code, subtotal, lang);
      if (res.ok && res.code) {
        cartStore.setCoupon({ code: res.code, discount: res.discount ?? 0, label: res.label ?? '' });
        setCode('');
      } else {
        setError(res.error ?? '');
      }
    });

  return (
    <div className="bg-linen-dark/60 p-4 border border-linen-border">
      <label htmlFor="promo-input" className="block text-[11px] uppercase tracking-wider text-bordeaux mb-2 font-serif font-bold">
        {t.promoLabel}
      </label>
      {coupon ? (
        <div className="flex items-center justify-between gap-3 text-[11px] text-emerald-700">
          <span>{fill(t.promoApplied, { code: coupon.code, amount: priceNumber(coupon.discount) })}</span>
          <button type="button" onClick={() => cartStore.setCoupon(null)} className="text-stone-500 underline hover:text-bordeaux shrink-0">
            {t.promoRemove}
          </button>
        </div>
      ) : (
        <>
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) apply();
            }}
          >
            <input
              id="promo-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t.promoPlaceholder}
              className="latin flex-1 min-w-0 bg-white border border-linen-border px-3 py-2 text-xs text-noir focus:border-bordeaux outline-none tracking-wider"
            />
            <button
              type="submit"
              disabled={pending || !code.trim()}
              className="px-4 py-2 bg-bordeaux hover:bg-bordeaux-dark text-linen-light text-xs uppercase tracking-wider font-medium transition-colors disabled:opacity-60"
            >
              {pending ? '…' : t.promoApply}
            </button>
          </form>
          {error && <p className="text-[11px] text-red-700 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
}
