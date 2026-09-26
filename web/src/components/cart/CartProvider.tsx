'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  cartStore,
  extrasStore,
  linesStore,
  subscribeNoop,
  toggleWishlist,
  wishlistStore,
  type CartExtras,
} from '@/lib/cart-store';
import { uiStore, type UiState } from '@/lib/ui-store';
import type { CartLine } from '@/lib/types';

export interface CartApi extends CartExtras {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** false لحد ما المتصفح يقرا العربة المحفوظة. */
  ready: boolean;
}

export function useCart(): CartApi {
  const lines = useSyncExternalStore(
    linesStore.subscribe,
    linesStore.getSnapshot,
    linesStore.getServerSnapshot,
  );
  const extras = useSyncExternalStore(
    extrasStore.subscribe,
    extrasStore.getSnapshot,
    extrasStore.getServerSnapshot,
  );
  const ready = useHydrated();

  return useMemo(
    () => ({
      ...extras,
      lines,
      ready,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    [lines, extras, ready],
  );
}

export function useWishlist(): string[] {
  return useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot,
  );
}

export function useUi(): UiState {
  return useSyncExternalStore(
    uiStore.subscribe,
    uiStore.getSnapshot,
    uiStore.getServerSnapshot,
  );
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export { cartStore, toggleWishlist, uiStore };
