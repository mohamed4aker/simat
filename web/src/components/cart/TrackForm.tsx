'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, AlertCircle } from 'lucide-react';

import { lookupOrder } from '@/app/track/actions';
import { buttonStyles, Card } from '@/components/ui';
import { dateTimeAr, price } from '@/lib/format';
import { orderStatusLabels, paymentLabels, type OrderStatus } from '@/lib/types';
import type { TrackedOrder } from '@/lib/store';

const FLOW: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'shipped', 'delivered',
];

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm ' +
  'outline-none focus:border-wine transition-colors';

export function TrackForm() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('number') ?? '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    startTransition(async () => {
      const result = await lookupOrder(orderNumber, phone);
      if (!result.ok || !result.order) {
        setError(result.error ?? 'الطلب مش موجود');
        return;
      }
      setOrder(result.order);
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="رقم الطلب — SM-202601-1001"
          className={inputClass} dir="ltr" aria-label="رقم الطلب" required
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="رقم الموبايل" className={inputClass} dir="ltr"
          inputMode="tel" aria-label="رقم الموبايل" required
        />
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          <Search size={17} />
          {pending ? 'بندوّر...' : 'ابحث'}
        </button>
      </form>

      {error && (
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-bad/10 px-4 py-3 text-sm text-bad">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </p>
      )}

      {order && (
        <div className="mt-8 space-y-5">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-faint">رقم الطلب</p>
                <p className="text-lg font-extrabold" dir="ltr">
                  {order.orderNumber}
                </p>
              </div>
              <span className="rounded-full bg-wine px-3 py-1.5 text-xs font-bold text-white">
                {orderStatusLabels[order.status]}
              </span>
            </div>
            <p className="mt-3 text-xs text-faint">
              اتعمل {dateTimeAr(order.createdAt)}
            </p>

            {!['cancelled', 'returned'].includes(order.status) && (
              <ol className="mt-6 space-y-4">
                {FLOW.map((s, i) => {
                  const done = FLOW.indexOf(order.status) >= i;
                  const at = order.events.find((e) => e.status === s);
                  return (
                    <li key={s} className="flex gap-3">
                      <span
                        className={`mt-0.5 grid place-items-center w-5 h-5 rounded-full border-2 text-[10px] shrink-0 ${
                          done
                            ? 'bg-wine border-wine text-white'
                            : 'border-line text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <div>
                        <p className={`text-sm ${done ? 'font-bold' : 'text-faint'}`}>
                          {orderStatusLabels[s]}
                        </p>
                        {at && (
                          <p className="text-[11px] text-faint">
                            {dateTimeAr(at.createdAt)}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-bold mb-3">المنتجات</h2>
            <ul className="space-y-2">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted">
                    {it.name}{' '}
                    <span className="text-faint">
                      {it.sizeMl} مل × {it.quantity}
                    </span>
                  </span>
                  <b>{price(it.unitPrice * it.quantity)}</b>
                </li>
              ))}
            </ul>
            <div className="h-px bg-line my-4" />
            <Row label="المجموع الفرعي" value={price(order.subtotal)} />
            <Row
              label="الشحن"
              value={order.shipping === 0 ? 'مجاني' : price(order.shipping)}
            />
            {order.discount > 0 && (
              <Row label="الخصم" value={`- ${price(order.discount)}`} />
            )}
            <Row label="طريقة الدفع" value={paymentLabels[order.paymentMethod]} />
            <div className="h-px bg-line my-3" />
            <div className="flex justify-between">
              <b>الإجمالي</b>
              <b className="text-wine text-lg">{price(order.total)}</b>
            </div>
            <p className="mt-4 text-xs text-faint leading-6">
              الشحن إلى: {order.governorate} — {order.city}، {order.street}
            </p>
          </Card>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted">{label}</span>
      <b>{value}</b>
    </div>
  );
}
