import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderReceived } from '@/components/cart/OrderReceived';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OrderReceivedPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Suspense fallback={<div className="h-80 bg-linen animate-pulse" />}>
        <OrderReceived />
      </Suspense>
    </div>
  );
}
