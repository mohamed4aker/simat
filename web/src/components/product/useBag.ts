'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { cartStore, toggleWishlist, uiStore } from '@/components/cart/CartProvider';
import type { Product } from '@/lib/types';

/** إضافة للسلة وفتحها، وحفظ في المفضلة مع رسالة تأكيد. */
export function useBag() {
  const { dict } = useI18n();
  return {
    add(product: Product | Product[], quantity = 1, sizeMl?: number) {
      const list = Array.isArray(product) ? product : [product];
      list.forEach((p) => cartStore.add(p, quantity, sizeMl));
      uiStore.open('cart');
    },
    toggleSaved(product: Product) {
      const saved = toggleWishlist(product.id);
      uiStore.toast(saved ? dict.wishlist.saved : dict.wishlist.unsave);
    },
  };
}
