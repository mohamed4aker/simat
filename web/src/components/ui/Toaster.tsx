'use client';

import { useUi } from '@/components/cart/CartProvider';

/** رسالة تأكيد صغيرة تحت الشاشة (اتضاف للسلة، اتحفظ …). */
export function Toaster() {
  const { toast } = useUi();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 md:bottom-6 end-6 z-[80] flex items-center gap-3 bg-noir text-linen-light px-5 py-3 text-xs shadow-2xl border border-white/20 transition-all duration-300 pointer-events-none ${
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
      <span>{toast?.message}</span>
    </div>
  );
}
