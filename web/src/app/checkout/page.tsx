import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/cart/CheckoutForm';
import { isLive } from '@/lib/store';

export const metadata: Metadata = {
  title: 'إتمام الطلب',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-2">إتمام الطلب</h1>
      <p className="text-muted mb-8">
        مش محتاج تسجّل حساب — اكتب بياناتك والطلب هيوصلك.
      </p>

      {!isLive && (
        <div className="mb-6 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm">
          <b>وضع العرض:</b> قاعدة البيانات لسه مش متوصّلة، فالطلب هيتحسب
          بس ومش هيتسجّل. راجع <code>web/README.md</code> لخطوات الربط.
        </div>
      )}

      <CheckoutForm />
    </div>
  );
}
