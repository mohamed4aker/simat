import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderReceived } from '@/components/cart/OrderReceived';

export const metadata: Metadata = {
  title: 'تم استلام طلبك',
  robots: { index: false, follow: false },
};

export default function OrderReceivedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-sand/40" />}>
        <OrderReceived />
      </Suspense>
    </div>
  );
}
