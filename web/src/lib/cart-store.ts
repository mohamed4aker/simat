/**
 * عربة التسوق + كود الخصم + خيار الهدية — كلهم محفوظين في المتصفح.
 */
import { createPersistedStore } from './persisted-store';
import { defaultVariant, priceFor } from './pricing';
import type { CartLine, Product } from './types';

/** كل سطر في السلة = منتج + حجم. */
export const lineKey = (l: Pick<CartLine, 'productId' | 'sizeMl'>) =>
  `${l.productId}:${l.sizeMl}`;

export { subscribeNoop } from './persisted-store';

const EMPTY: CartLine[] = [];

export const linesStore = createPersistedStore<CartLine[]>(
  'simat.cart.v3',
  EMPTY,
  (v): v is CartLine[] =>
    Array.isArray(v) && v.every((l) => l && typeof l.productId === 'string'),
);

export interface CartExtras {
  coupon: { code: string; discount: number; label: string } | null;
  isGift: boolean;
  giftMessage: string;
}

const NO_EXTRAS: CartExtras = { coupon: null, isGift: false, giftMessage: '' };

export const extrasStore = createPersistedStore<CartExtras>(
  'simat.cart.extras.v1',
  NO_EXTRAS,
  (v): v is CartExtras => typeof v === 'object' && v !== null && 'isGift' in v,
);

function commit(next: CartLine[]) {
  linesStore.set(next);
  // أي تغيير في العربة بيلغي الخصم المحسوب — لازم يتحسب تاني.
  if (extrasStore.get().coupon) {
    extrasStore.set({ ...extrasStore.get(), coupon: null });
  }
}

export const cartStore = {
  add(product: Product, quantity = 1, sizeMl?: number) {
    const lines = linesStore.get();
    const size = sizeMl ?? defaultVariant(product).sizeMl;
    const key = lineKey({ productId: product.id, sizeMl: size });
    const max = product.stock > 0 ? product.stock : 99;
    const found = lines.find((l) => lineKey(l) === key);
    if (found) {
      commit(
        lines.map((l) =>
          lineKey(l) === key
            ? { ...l, quantity: Math.min(l.quantity + quantity, max) }
            : l,
        ),
      );
      return;
    }
    commit([
      ...lines,
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        nameEn: product.nameEn,
        price: priceFor(product, size),
        sizeMl: size,
        quantity: Math.min(quantity, max),
        imageUrl: product.imageUrl,
        labelStyle: product.labelStyle,
        kind: product.kind,
      },
    ]);
  },

  setQuantity(key: string, quantity: number) {
    const lines = linesStore.get();
    commit(
      quantity <= 0
        ? lines.filter((l) => lineKey(l) !== key)
        : lines.map((l) => (lineKey(l) === key ? { ...l, quantity } : l)),
    );
  },

  remove(key: string) {
    commit(linesStore.get().filter((l) => lineKey(l) !== key));
  },

  clear() {
    linesStore.set(EMPTY);
    extrasStore.set(NO_EXTRAS);
  },

  setCoupon(coupon: CartExtras['coupon']) {
    extrasStore.set({ ...extrasStore.get(), coupon });
  },

  setGift(isGift: boolean, giftMessage?: string) {
    const current = extrasStore.get();
    extrasStore.set({
      ...current,
      isGift,
      giftMessage: giftMessage ?? current.giftMessage,
    });
  },
};

export const wishlistStore = createPersistedStore<string[]>(
  'simat.wishlist.v1',
  [],
  (v): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string'),
);

export function toggleWishlist(productId: string): boolean {
  const list = wishlistStore.get();
  const has = list.includes(productId);
  wishlistStore.set(has ? list.filter((id) => id !== productId) : [...list, productId]);
  return !has;
}
