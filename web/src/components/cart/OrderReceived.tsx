'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useSyncExternalStore } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { buttonStyles, Card } from '@/components/ui';
import { subscribeNoop } from '@/lib/cart-store';
import { DELIVERY_DAYS, STORE } from '@/lib/constants';
import { price } from '@/lib/format';

interface LastOrder {
  orderNumber: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  phone: string;
  name: string;
  demo: boolean;
}

export function OrderReceived() {
  const params = useSearchParams();
  const numberFromUrl = params.get('number') ?? '';

  // بنقرا تفاصيل آخر طلب من تخزين الجلسة بعد الـ hydration.
  const raw = useSyncExternalStore(
    subscribeNoop,
    () => {
      try {
        return sessionStorage.getItem('simat.lastOrder');
      } catch {
        return null;
      }
    },
    () => null,
  );

  const order = useMemo<LastOrder | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LastOrder;
    } catch {
      return null;
    }
  }, [raw]);

  const orderNumber = order?.orderNumber ?? numberFromUrl;

  return (
    <div className="text-center">
      <span className="inline-grid place-items-center w-24 h-24 rounded-full bg-ok/10 text-ok">
        <CheckCircle2 size={54} />
      </span>

      <h1 className="mt-6 text-3xl font-extrabold">تم استلام طلبك 🎉</h1>
      <p className="mt-3 text-muted leading-8">
        شكراً {order?.name ? order.name : 'لثقتك في سِمة'}. هنتواصل معاك على
        الموبايل لتأكيد الطلب قبل الشحن.
      </p>

      {order?.demo && (
        <p className="mt-4 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm">
          ده طلب تجريبي — قاعدة البيانات لسه مش متوصّلة، فالطلب ما اتسجّلش.
        </p>
      )}

      <Card className="mt-8 p-6 text-right">
        <Row label="رقم الطلب" value={orderNumber || '—'} bold />
        {order && (
          <>
            <Row label="المجموع الفرعي" value={price(order.subtotal)} />
            <Row
              label="الشحن"
              value={order.shipping === 0 ? 'مجاني' : price(order.shipping)}
            />
            {order.discount > 0 && (
              <Row label="الخصم" value={`- ${price(order.discount)}`} />
            )}
            <div className="h-px bg-line my-3" />
            <Row label="الإجمالي" value={price(order.total)} bold />
          </>
        )}
        <p className="mt-4 text-xs text-faint leading-6">
          التوصيل المتوقع خلال {DELIVERY_DAYS.min}–{DELIVERY_DAYS.max} أيام عمل.
          <br />
          احتفظ برقم الطلب عشان تقدر تتابعه في أي وقت.
        </p>
      </Card>

      <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/track?number=${encodeURIComponent(orderNumber)}`}
          className={buttonStyles.primary}
        >
          تتبّع الطلب
        </Link>
        <Link href="/shop" className={buttonStyles.outline}>
          أكمل التسوّق
        </Link>
      </div>

      <p className="mt-8 text-sm text-muted">
        أي استفسار؟ اتصل بينا على{' '}
        <a href={`tel:${STORE.phone}`} dir="ltr" className="font-bold text-wine">
          {STORE.phone}
        </a>
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className={bold ? 'font-bold' : 'text-muted text-sm'}>{label}</span>
      <b className={bold ? 'text-wine text-lg' : 'text-sm'} dir="auto">
        {value}
      </b>
    </div>
  );
}
