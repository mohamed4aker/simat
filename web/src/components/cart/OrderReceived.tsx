'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useSyncExternalStore } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { price } from '@/lib/format';
import { subscribeNoop } from '@/lib/persisted-store';
import { whatsappLink } from '@/lib/constants';
import { btn } from '@/components/ui/store';
import { LAST_ORDER_KEY } from './CheckoutForm';

interface LastOrder {
  orderNumber: string;
  total: number;
  demo: boolean;
}

export function OrderReceived() {
  const { lang, dict } = useI18n();
  const t = dict.orderReceived;
  const numberFromUrl = useSearchParams().get('number') ?? '';

  const raw = useSyncExternalStore(
    subscribeNoop,
    () => {
      try {
        return sessionStorage.getItem(LAST_ORDER_KEY);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const order = useMemo<LastOrder | null>(() => {
    try {
      return raw ? (JSON.parse(raw) as LastOrder) : null;
    } catch {
      return null;
    }
  }, [raw]);

  const number = order?.orderNumber ?? numberFromUrl;

  return (
    <div className="text-center bg-linen border border-linen-border p-8 sm:p-12">
      <CheckCircle2 className="w-12 h-12 text-bordeaux mx-auto" strokeWidth={1.2} />
      <span className="mt-4 block text-xs uppercase tracking-[0.25em] text-bordeaux font-serif font-bold">{t.eyebrow}</span>
      <h1 className="mt-2 text-3xl font-serif text-noir">{t.title}</h1>
      <p className="mt-3 text-sm text-stone-600 max-w-md mx-auto">{t.body}</p>

      {number && (
        <dl className="mt-8 inline-grid grid-cols-2 gap-x-10 gap-y-1 text-start bg-white border border-linen-border px-6 py-4">
          <dt className="text-[11px] uppercase tracking-wider text-stone-500">{t.number}</dt>
          <dt className="text-[11px] uppercase tracking-wider text-stone-500">{order ? t.total : ''}</dt>
          <dd className="latin text-lg text-noir font-medium" dir="ltr">{number}</dd>
          <dd className="latin text-lg text-bordeaux font-medium">{order ? price(order.total, lang) : ''}</dd>
        </dl>
      )}

      {order?.demo && <p className="mt-6 text-xs text-amber-800">{t.demo}</p>}

      <div className="mt-10 flex flex-wrap gap-3 justify-center">
        <Link href={to(lang, '/track')} className={btn.primary}>{t.track}</Link>
        <Link href={to(lang, '/shop')} className={btn.outline}>{t.continue}</Link>
      </div>
      <a
        href={whatsappLink(number ? `${t.number}: ${number}` : '')}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block text-xs text-bordeaux hover:underline"
      >
        {dict.mega.about.cardCta}
      </a>
    </div>
  );
}
