'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AlertCircle } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { lookupOrder } from '@/lib/actions/track';
import { dateFor, price } from '@/lib/format';
import { btn, field } from '@/components/ui/store';
import type { TrackedOrder } from '@/lib/store';
import type { OrderStatus } from '@/lib/types';

const FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

export function TrackForm() {
  const { lang, dict } = useI18n();
  const t = dict.track;
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('number') ?? '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    start(async () => {
      const res = await lookupOrder(orderNumber, phone, lang);
      if (!res.ok || !res.order) setError(res.error ?? '');
      else setOrder(res.order);
    });
  };

  return (
    <>
      <form onSubmit={submit} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder={t.numberPlaceholder} aria-label={t.number} dir="ltr" required className={`${field} text-start`} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phone} aria-label={t.phone} dir="ltr" inputMode="tel" required className={`${field} text-start`} />
        <button type="submit" disabled={pending} className={`${btn.primary} !py-3`}>
          {pending ? dict.common.loading : t.submit}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-5 flex gap-2 items-start text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </p>
      )}

      {order && (
        <div className="mt-8 bg-linen border border-linen-border p-6 space-y-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-stone-500">{t.number}</p>
              <p className="latin text-lg text-noir" dir="ltr">{order.orderNumber}</p>
              <p className="text-[11px] text-stone-500 mt-1">{t.placed} {dateFor(order.createdAt, lang)}</p>
            </div>
            <span className="px-3 py-1.5 text-xs bg-bordeaux text-linen-light">{dict.orderStatus[order.status]}</span>
          </div>

          {!['cancelled', 'returned'].includes(order.status) && (
            <ol className="grid grid-cols-5 gap-2">
              {FLOW.map((s, i) => {
                const done = FLOW.indexOf(order.status) >= i;
                return (
                  <li key={s} className="text-center">
                    <span className={`block h-1 ${done ? 'bg-bordeaux' : 'bg-stone-300'}`} />
                    <span className={`block mt-2 text-[10px] ${done ? 'text-noir' : 'text-stone-400'}`}>{dict.orderStatus[s]}</span>
                  </li>
                );
              })}
            </ol>
          )}

          <div>
            <h2 className="text-xs uppercase tracking-wider font-serif font-bold text-noir mb-2">{t.items}</h2>
            <ul className="divide-y divide-linen-border text-sm">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3 py-2">
                  <span className="text-stone-700">{it.name} <span className="latin text-stone-400">× {it.quantity}</span></span>
                  <span className="latin">{price(it.unitPrice * it.quantity, lang)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-linen-border space-y-1 text-xs text-stone-600">
              <p className="flex justify-between"><span>{dict.cart.shipping}</span><span className="latin">{order.shipping === 0 ? dict.cart.free : price(order.shipping, lang)}</span></p>
              {order.discount > 0 && <p className="flex justify-between"><span>{dict.cart.discount}</span><span className="latin">−{price(order.discount, lang)}</span></p>}
              <p className="flex justify-between"><span>{dict.checkout.payment}</span><span>{dict.payment[order.paymentMethod]}</span></p>
              <p className="flex justify-between text-base text-noir font-medium pt-2"><span>{dict.cart.total}</span><span className="latin text-bordeaux">{price(order.total, lang)}</span></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
