'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { price } from '@/lib/format';
import { productText } from '@/lib/localize';
import { cartStore, toggleWishlist, useUi, useWishlist, uiStore } from '@/components/cart/CartProvider';
import { Modal } from '@/components/ui/Modal';
import type { Product } from '@/lib/types';

export function WishlistModal({ products }: { products: Product[] }) {
  const { lang, dict } = useI18n();
  const open = useUi().panel === 'wishlist';
  const ids = useWishlist();
  const saved = products.filter((p) => ids.includes(p.id));

  return (
    <Modal
      open={open}
      onClose={() => uiStore.close()}
      label={dict.wishlist.title}
      closeLabel={dict.common.close}
      className="max-w-md"
    >
      <h3 className="text-sm font-serif text-bordeaux uppercase tracking-wider mb-4">{dict.wishlist.title}</h3>
      {saved.length === 0 ? (
        <p className="text-xs text-stone-500 py-6 text-center">{dict.wishlist.empty}</p>
      ) : (
        <ul className="divide-y divide-linen-border">
          {saved.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <Link
                href={to(lang, `/product/${p.slug}`)}
                onClick={() => uiStore.close()}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-serif text-noir font-bold truncate">{productText(p, lang).name}</p>
                <p className="text-[11px] text-bordeaux latin">{price(p.price, lang)}</p>
              </Link>
              <button
                type="button"
                onClick={() => {
                  cartStore.add(p);
                  uiStore.open('cart');
                }}
                className="text-[11px] uppercase tracking-wider text-bordeaux hover:underline"
              >
                + {dict.common.addToBag}
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(p.id)}
                className="p-1 text-stone-400 hover:text-bordeaux"
                aria-label={dict.wishlist.unsave}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
