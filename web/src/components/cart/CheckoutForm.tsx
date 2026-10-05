'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AlertCircle, Gift, Lock } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { fill } from '@/i18n/fill';
import { to } from '@/lib/href';
import { price } from '@/lib/format';
import { lineName } from '@/lib/localize';
import {
  AREA_SUGGESTIONS,
  FAST_DELIVERY,
  GOVERNORATE_EN,
  GOVERNORATES,
  shippingFor,
} from '@/lib/constants';
import { submitOrder } from '@/lib/actions/checkout';
import { cartStore, useCart } from './CartProvider';
import { btn, field } from '@/components/ui/store';
import type { PaymentMethod } from '@/lib/types';

export const LAST_ORDER_KEY = 'simat.lastOrder';

export function CheckoutForm({ demo }: { demo: boolean }) {
  const { lang, dict } = useI18n();
  const t = dict.checkout;
  const router = useRouter();
  const cart = useCart();
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    altPhone: '',
    email: '',
    governorate: 'الإسكندرية',
    city: '',
    street: '',
    addressNotes: '',
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const discount = cart.coupon?.discount ?? 0;
  const shipping = shippingFor(form.governorate, cart.subtotal);
  const total = Math.max(0, cart.subtotal - discount) + shipping;
  const govLabel = (g: string) => (lang === 'en' ? GOVERNORATE_EN[g] ?? g : g);
  const areas = AREA_SUGGESTIONS[form.governorate] ?? [];

  if (cart.ready && cart.lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-serif text-noir">{t.emptyTitle}</h2>
        <p className="mt-3 text-sm text-stone-600">{t.emptyBody}</p>
        <Link href={to(lang, '/shop')} className={`${btn.primary} mt-8`}>
          {dict.cart.continue}
        </Link>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    start(async () => {
      const result = await submitOrder({
        lang,
        ...form,
        building: '',
        notes: '',
        paymentMethod: payment,
        couponCode: cart.coupon?.code ?? '',
        isGift: cart.isGift,
        giftMessage: cart.giftMessage,
        items: cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity, sizeMl: l.sizeMl })),
      });
      if (!result.ok) {
        setError(result.error ?? t.errors.generic);
        return;
      }
      try {
        sessionStorage.setItem(
          LAST_ORDER_KEY,
          JSON.stringify({
            orderNumber: result.orderNumber,
            total: result.total,
            demo: Boolean(result.demo),
            payment,
          }),
        );
      } catch {
        // مش مهم لو ما اتحفظش — رقم الطلب في الرابط.
      }
      cartStore.clear();
      router.push(to(lang, `/order-received?number=${encodeURIComponent(result.orderNumber ?? '')}`));
    });
  };

  const label = (text: string, required = true) => (
    <span className="block text-[11px] uppercase tracking-wider text-stone-600 mb-1">
      {text}
      {required ? ' *' : <span className="normal-case text-stone-400"> ({dict.common.optional})</span>}
    </span>
  );

  return (
    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-7 space-y-5">
        {demo && (
          <div className="flex gap-2 items-start border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{dict.orderReceived.demo}</span>
          </div>
        )}

        <label className="block">
          {label(t.name)}
          <input required minLength={3} autoComplete="name" value={form.fullName} onChange={set('fullName')} placeholder={t.namePlaceholder} className={field} />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            {label(t.phone)}
            <input required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" value={form.phone} onChange={set('phone')} placeholder={t.phonePlaceholder} className={`${field} text-start`} />
          </label>
          <label className="block">
            {label(t.altPhone, false)}
            <input type="tel" inputMode="tel" dir="ltr" value={form.altPhone} onChange={set('altPhone')} placeholder="012 9876 5432" className={`${field} text-start`} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            {label(t.governorate)}
            <select required value={form.governorate} onChange={set('governorate')} className={field}>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>{govLabel(g)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            {label(t.area)}
            <input required list="area-list" value={form.city} onChange={set('city')} placeholder={areas[0] ? areas[0][lang] : t.areaPlaceholder} className={field} />
            <datalist id="area-list">
              {areas.map((a) => (
                <option key={a.ar} value={a[lang]} />
              ))}
            </datalist>
          </label>
        </div>

        <label className="block">
          {label(t.address)}
          <input required autoComplete="street-address" value={form.street} onChange={set('street')} placeholder={t.addressPlaceholder} className={field} />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            {label(t.email, false)}
            <input type="email" autoComplete="email" dir="ltr" value={form.email} onChange={set('email')} placeholder={t.emailHint} className={`${field} text-start`} />
          </label>
          <label className="block">
            {label(t.notes, false)}
            <input value={form.addressNotes} onChange={set('addressNotes')} placeholder={t.notesPlaceholder} className={field} />
          </label>
        </div>

        <fieldset className="pt-4 border-t border-linen-border space-y-2">
          <legend className="block text-[11px] uppercase tracking-wider text-stone-700 font-medium mb-2">{t.payment}</legend>
          {(
            [
              ['cod', t.cod, t.codSub],
              ['card', t.card, t.cardSub],
            ] as const
          ).map(([value, title, sub]) => (
            <label
              key={value}
              className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                payment === value ? 'bg-linen border-bordeaux' : 'bg-white border-linen-border hover:border-bordeaux/50'
              }`}
            >
              <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} className="accent-bordeaux mt-0.5" />
              <span>
                <span className="text-sm text-noir block">{title}</span>
                <span className="text-[11px] text-stone-500">{sub}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      {/* ملخص الطلب */}
      <aside className="lg:col-span-5 lg:sticky lg:top-32 bg-linen border border-linen-border p-6 space-y-5">
        <h2 className="text-sm uppercase tracking-wider font-serif text-noir font-bold">{t.summary}</h2>
        <ul className="divide-y divide-linen-border text-xs">
          {cart.lines.map((l) => (
            <li key={`${l.productId}:${l.sizeMl}`} className="flex justify-between gap-3 py-2.5">
              <span className="text-stone-700">
                {lineName(l, lang)}{' '}
                <span className="latin text-stone-400">
                  {l.kind === 'bottle' ? `${l.sizeMl} ml ` : ''}× {l.quantity}
                </span>
              </span>
              <span className="latin text-noir shrink-0">{price(l.price * l.quantity, lang)}</span>
            </li>
          ))}
        </ul>

        {cart.isGift && (
          <p className="flex items-center gap-2 text-[11px] text-bordeaux">
            <Gift className="w-3.5 h-3.5" /> {t.gift}
          </p>
        )}

        <dl className="space-y-1.5 text-xs border-t border-linen-border pt-4">
          <div className="flex justify-between text-stone-600">
            <dt>{dict.cart.subtotal}</dt>
            <dd className="latin">{price(cart.subtotal, lang)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>{dict.cart.discount} ({cart.coupon?.code})</dt>
              <dd className="latin">−{price(discount, lang)}</dd>
            </div>
          )}
          <div className="flex justify-between text-stone-600">
            <dt>{dict.cart.shipping} · {govLabel(form.governorate)}</dt>
            <dd className={shipping === 0 ? 'text-emerald-700 font-medium' : 'latin'}>
              {shipping === 0 ? dict.cart.free : price(shipping, lang)}
            </dd>
          </div>
          <div className="flex justify-between text-base font-medium text-noir pt-3 border-t border-linen-border">
            <dt>{dict.cart.total}</dt>
            <dd className="latin text-bordeaux font-bold">{price(total, lang)}</dd>
          </div>
        </dl>

        <p className="text-[11px] text-stone-500">
          {fill(t.delivery, {
            days: FAST_DELIVERY.includes(form.governorate) ? t.deliveryFast : t.deliveryStandard,
          })}
        </p>

        {error && (
          <p role="alert" className="flex gap-2 items-start text-xs text-red-700 bg-red-50 border border-red-200 p-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        <button type="submit" disabled={pending || !cart.ready} className={`${btn.primary} w-full`}>
          {pending ? t.placing : t.confirm}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
          <Lock className="w-3 h-3" /> {t.secure}
        </p>
      </aside>
    </form>
  );
}
