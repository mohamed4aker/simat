import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TrackForm } from '@/components/cart/TrackForm';

export const metadata: Metadata = {
  title: 'تتبّع طلبك',
  description:
    'تابع حالة طلبك من سِمة برقم الطلب ورقم الموبايل — من غير تسجيل دخول.',
  alternates: { canonical: '/track' },
};

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">تتبّع طلبك</h1>
      <p className="mt-2 text-muted">
        اكتب رقم الطلب ورقم الموبايل اللي طلبت بيه — من غير تسجيل دخول.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-sand/40" />}>
          <TrackForm />
        </Suspense>
      </div>
    </div>
  );
}
