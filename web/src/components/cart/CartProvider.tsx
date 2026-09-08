'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { cartStore, subscribeNoop } from '@/lib/cart-store';
import type { CartLine, Product } from '@/lib/types';

/**
 * مفيش Context هنا — كل مكوّن بيشترك في المخزن مباشرة.
 * الـ Provider موجود بس عشان يفضل شكل الشجرة واضح.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export interface CartApi {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** false لحد ما المتصفح يقرا العربة المحفوظة. */
  ready: boolean;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export function useCart(): CartApi {
  const lines = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );

  const ready = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  return useMemo(
    () => ({
      lines,
      ready,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      add: cartStore.add,
      setQuantity: cartStore.setQuantity,
      remove: cartStore.remove,
      clear: cartStore.clear,
    }),
    [lines, ready],
  );
}
